import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import UserCard from '../components/UserCard';
import api from '../services/api';
import { API_BASE } from '../utils/constants';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const socket = useMemo(() => {
    const token = localStorage.getItem('travelbuddy_token');
    return io(API_BASE.replace('/api', ''), { auth: { token } });
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/users').then((r) => setUsers(r.data.filter((u) => u._id !== user._id)));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const onPresence = (ids) => setOnlineUsers(ids);
    const onChat = (m) => {
      if (!selected) return;
      if (String(m.senderId) !== String(selected._id) && String(m.receiverId) !== String(selected._id)) return;
      setMessages((prev) => [...prev, m]);
    };
    const onTypingStart = ({ senderId }) => setTypingUsers((p) => [...new Set([...p, senderId])]);
    const onTypingStop = ({ senderId }) => setTypingUsers((p) => p.filter((id) => id !== senderId));

    socket.on('presence:update', onPresence);
    socket.on('chat:message', onChat);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('chat:message', onChat);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.disconnect();
    };
  }, [socket, user, selected]);

  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected._id}`).then((r) => setMessages(r.data));
  }, [selected]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className='flex flex-col h-[calc(100vh-140px)] space-y-4 max-w-6xl mx-auto'>
        <div className="flex flex-col gap-1 shrink-0">
          <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Messages</h1>
          <p className="text-gray-500">Connect and coordinate with your travel buddies.</p>
        </div>
        
        <div className='grid lg:grid-cols-[320px_1fr] flex-grow gap-6 min-h-0'>
          {/* User List Sidebar */}
          <div className='flex flex-col card overflow-hidden max-h-full'>
            <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h2 className="font-semibold text-gray-700">Conversations</h2>
            </div>
            <div className='overflow-y-auto w-full p-3 space-y-2 flex-grow'>
              {users.map((u) => (
                <button 
                  className={`w-full text-left rounded-2xl transition-all duration-200 ${selected?._id === u._id ? 'ring-2 ring-primary-500 shadow-md transform scale-[1.02]' : 'hover:bg-gray-50 opacity-80 hover:opacity-100'}`} 
                  key={u._id} 
                  onClick={() => setSelected(u)}
                >
                  <UserCard user={u} online={onlineUsers.includes(u._id)} />
                </button>
              ))}
              {users.length === 0 && (
                <div className="text-center p-8 text-gray-500 text-sm">No connections yet. Start matching!</div>
              )}
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="flex flex-col h-full min-h-0 bg-white card shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            {selected && user ? (
              <div className="flex flex-col h-full rounded-3xl overflow-hidden">
                <div className="p-4 bg-primary-50/50 border-b border-primary-100 flex items-center gap-4 shrink-0">
                  <img 
                    src={selected.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${selected.name}`} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{selected.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(selected._id) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-gray-500">{onlineUsers.includes(selected._id) ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
                {/* ChatBox should handle the flex-grow and overflow inside it */}
                <div className="flex-grow overflow-hidden relative">
                  <div className="absolute inset-0">
                    <ChatBox
                      selfId={user._id}
                      messages={messages}
                      isTyping={typingUsers.includes(selected._id)}
                      onSend={(message) => socket.emit('chat:send', { receiverId: selected._id, message })}
                      onTyping={(isTyping) => socket.emit(isTyping ? 'typing:start' : 'typing:stop', { receiverId: selected._id })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center p-10 h-full text-center'>
                <div className="w-24 h-24 mb-6 rounded-full bg-primary-50 flex items-center justify-center shadow-inner">
                  <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-sm">Select a conversation from the left to start coordinating your next trip.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
