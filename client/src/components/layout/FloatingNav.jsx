import { Link, useLocation } from 'react-router-dom';
import { GlobeAmericasIcon, MapIcon, ChatBubbleLeftRightIcon, UserGroupIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function FloatingNav() {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Explore', path: '/explore', icon: GlobeAmericasIcon },
    { label: 'Trips', path: '/dashboard', icon: MapIcon },
    { label: 'Chat', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { label: 'Groups', path: '/groups', icon: UserGroupIcon },
    { label: 'Profile', path: '/profile', icon: UserCircleIcon },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 px-2 py-2 bg-gray-900/95 backdrop-blur-xl rounded-full shadow-2xl shadow-gray-900/40 border border-gray-700/50">
        {navItems.map((item) => {
          const isActive = item.path === '/explore' ? pathname.startsWith('/explore') || pathname.startsWith('/trips/explore') :
                           item.path === '/dashboard' ? pathname === '/dashboard' || pathname === '/trips/create' :
                           pathname.startsWith(item.path);

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-center p-3 sm:px-5 sm:py-3.5 rounded-full transition-all duration-300 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              title={item.label}
            >
              {isActive && (
                <motion.div layoutId="floatingNavActive" className="absolute inset-0 bg-primary-600 rounded-full shadow-lg shadow-primary-600/30" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isActive && <span className="text-sm font-bold tracking-wide hidden sm:block">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
