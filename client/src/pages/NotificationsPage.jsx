import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { API_BASE } from '../utils/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function NotificationsPage() {
  const [notes, setNotes] = useState([]);

  const socket = useMemo(() => {
    const token = localStorage.getItem('travelbuddy_token');
    return io(API_BASE.replace('/api', ''), { auth: { token } });
  }, []);

  const load = async () => {
    const r = await api.get('/notifications');
    setNotes(r.data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      load();
    }, 25000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onNew = (n) => setNotes((prev) => [n, ...prev]);
    socket.on('notifications:new', onNew);
    return () => {
      socket.off('notifications:new', onNew);
      socket.disconnect();
    };
  }, [socket]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    await load();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className='max-w-4xl mx-auto space-y-8'>
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Notifications</h1>
            <p className="text-gray-500 mt-1">Stay updated on your trip requests and messages</p>
          </div>
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-xl relative">
            🔔
            {notes.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </div>
        </div>
        
        {notes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card p-12 flex flex-col items-center justify-center text-center'>
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4 text-gray-300">
              📭
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">You don't have any new notifications right now.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notes.map((n) => (
                <motion.div 
                  variants={fadeUp} 
                  initial="hidden" 
                  animate="visible" 
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  key={n._id} 
                  className={`card p-5 flex md:flex-row flex-col justify-between md:items-center gap-4 border-l-4 transition-all ${!n.read ? 'border-l-primary-500 bg-white' : 'border-l-transparent bg-gray-50/50 opacity-75'}`}
                >
                  <div className='min-w-0 flex-1 flex gap-4 items-start'>
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg ${!n.read ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                      {n.type === 'invite' ? '📨' : n.type === 'join_request' ? '👋' : '📝'}
                    </div>
                    <div>
                      <p className={`font-bold ${!n.read ? 'text-gray-900' : 'text-gray-700'} truncate`}>{n.title}</p>
                      <p className='text-sm text-gray-600 break-words mt-1 leading-relaxed'>{n.body}</p>
                      <div className='text-xs font-semibold text-primary-500 mt-2 tracking-wide uppercase'>
                        {n.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 self-start md:self-center shrink-0 ml-14 md:ml-0'>
                    {n.read ? (
                      <span className='px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider'>Read</span>
                    ) : n.type === 'invite' ? (
                      <button
                        className='btn-primary py-2 px-5 text-sm shadow-md'
                        onClick={async () => {
                          await api.post(`/groups/${n.groupId}/accept-invite`);
                          toast.success('Joined group successfully!');
                          await markRead(n._id);
                        }}
                      >
                        Join Group
                      </button>
                    ) : n.type === 'join_request' ? (
                      <button
                        className='btn-primary py-2 px-5 text-sm shadow-md'
                        onClick={async () => {
                          await api.post(`/groups/${n.groupId}/accept-join`, { requesterId: n.senderId });
                          toast.success('Request accepted!');
                          await markRead(n._id);
                        }}
                      >
                        Accept Request
                      </button>
                    ) : (
                      <button className='btn-secondary py-2 px-5 text-sm' onClick={() => markRead(n._id)}>
                        Mark as Read
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
