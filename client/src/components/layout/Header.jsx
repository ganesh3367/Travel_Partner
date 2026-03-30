import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { API_BASE } from '../../utils/constants';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const socket = useMemo(() => {
    const token = localStorage.getItem('travelbuddy_token');
    return token ? io(API_BASE.replace('/api', ''), { auth: { token } }) : null;
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(r => setNotifications(r.data));
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const onNewNotif = (n) => setNotifications(prev => [n, ...prev]);
    socket.on('notifications:new', onNewNotif);
    return () => socket.off('notifications:new', onNewNotif);
  }, [socket]);

  const handleLogout = () => {
    if (socket) socket.disconnect();
    logout();
    nav('/');
  };

  const markRead = async (id, path) => {
    setNotifOpen(false);
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      if (path) nav(path);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read'); // wait, do I have this endpoint?
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const navLinks = [
    { label: 'Discover', path: '/trips/explore' },
    { label: 'Matching', path: '/explore' },
    { label: 'My Trips', path: '/dashboard' },
    { label: 'Chat', path: '/chat' },
    { label: 'Groups', path: '/groups' }
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 shrink-0">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2 group">
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-md shadow-primary/30">T</div>
           <span className="font-bold text-xl text-dark tracking-tight hidden sm:block">TravelBuddy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
           {navLinks.map((link) => {
             const isActive = link.path === '/explore' 
                ? pathname.startsWith('/explore') 
                : link.path === '/dashboard' 
                  ? (pathname === '/dashboard' || pathname.startsWith('/trips'))
                  : pathname.startsWith(link.path);

             return (
               <Link key={link.path} to={link.path} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-primary-50 text-primary-700' : 'text-graytext hover:bg-gray-50 hover:text-dark'}`}>
                 {link.label}
               </Link>
             );
           })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 flex flex-col max-h-[80vh]">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark all read</button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No new notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => markRead(n._id, n.type === 'message' ? '/chat' : n.type.includes('trip') ? '/dashboard' : n.type === 'invite' ? '/groups' : null)}
                      className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors">
              {user?.profileImage ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover"/> : user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => { setMenuOpen(false); nav('/profile'); }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
