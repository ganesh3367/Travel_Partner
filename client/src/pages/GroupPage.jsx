import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import { API_BASE } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import UserCard from '../components/UserCard';
import { UsersIcon, UserPlusIcon, MapIcon, GlobeAsiaAustraliaIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function GroupPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [createForm, setCreateForm] = useState({ groupName: '', tripId: '' });

  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState([]);

  const [messages, setMessages] = useState([]);

  const [socketConnected, setSocketConnected] = useState(false);

  const socket = useMemo(() => {
    const token = localStorage.getItem('travelbuddy_token');
    return io(API_BASE.replace('/api', ''), { auth: { token } });
  }, []);

  const loadGroups = async () => {
    const r = await api.get('/groups');
    setGroups(r.data);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const onGroupMessage = (m) => {
      if (!selectedGroup) return;
      if (String(m.groupId) !== String(selectedGroup._id)) return;
      setMessages((prev) => [...prev, m]);
    };

    socket.on('group:message', onGroupMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('group:message', onGroupMessage);
      socket.disconnect();
    };
  }, [socket, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;
    socket.emit('group:join', selectedGroup._id);
    api.get(`/messages/group/${selectedGroup._id}`).then((r) => setMessages(r.data));
  }, [selectedGroup, socket]);

  useEffect(() => {
    if (!inviteQuery.trim()) {
      setInviteResults([]);
      return;
    }

    const id = setTimeout(async () => {
      const r = await api.get('/users', { params: { q: inviteQuery } });
      setInviteResults(r.data.filter((u) => String(u._id) !== String(user?._id)));
    }, 350);
    return () => clearTimeout(id);
  }, [inviteQuery, user]);

  const isMember = (group) => !!group?.members?.some((m) => String(m._id || m) === String(user?._id));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className='flex flex-col h-[calc(100vh-140px)] space-y-6 max-w-7xl mx-auto'>
        <div className='flex items-center justify-between gap-3 flex-wrap shrink-0 bg-white p-6 rounded-3xl shadow-sm border border-gray-100'>
          <div>
            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Trip Groups</h1>
            <p className="text-gray-500 mt-1">Chat and coordinate with your entire squad</p>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200'>
            <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></span>
            <span className='text-sm font-medium text-gray-600'>Sys: {socketConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>

        <form
          className='card p-6 grid md:grid-cols-[1fr_1fr_auto] gap-4 shrink-0 bg-gradient-to-r from-white to-primary-50/30'
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post('/groups', createForm);
            setCreateForm({ groupName: '', tripId: '' });
            await loadGroups();
            toast.success("Group created!");
          }}
        >
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Group Name</label>
            <input
              className='input'
              placeholder='E.g. Bali Advetures 2026'
              value={createForm.groupName}
              onChange={(e) => setCreateForm((f) => ({ ...f, groupName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Trip Event ID</label>
            <input
              className='input'
              placeholder='Paste trip ID here...'
              value={createForm.tripId}
              onChange={(e) => setCreateForm((f) => ({ ...f, tripId: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-end">
            <button className='btn-primary h-[50px] px-8'>Create Group</button>
          </div>
        </form>

        <div className='grid lg:grid-cols-[350px_1fr] gap-6 flex-grow min-h-0'>
          {/* Group List Sidebar */}
          <div className='flex flex-col space-y-4 overflow-y-auto pr-2 pb-4 max-h-full'>
            {groups.map((g) => (
              <button
                key={g._id}
                className={`w-full text-left card p-5 transition-all duration-200 ${
                  selectedGroup?._id === g._id 
                  ? 'ring-2 ring-primary-500 shadow-md transform scale-[1.02] bg-primary-50/10' 
                  : 'hover:shadow-md hover:-translate-y-1 opacity-90 hover:opacity-100'
                }`}
                onClick={() => setSelectedGroup(g)}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='font-bold text-lg text-gray-900'>{g.groupName}</h3>
                    <p className='text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5'>
                      <UsersIcon className="w-4 h-4" /> {g.members?.length || 0} Members
                    </p>
                  </div>
                  {isMember(g) ? (
                    <span className='bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider'>Joined</span> 
                  ) : (
                    <span className='bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200'>Discover</span>
                  )}
                </div>
              </button>
            ))}
            {groups.length === 0 && (
              <div className='card p-10 text-center flex flex-col items-center gap-3'>
                <MapIcon className="w-12 h-12 text-gray-300" />
                <div className="text-gray-500 font-medium">No groups available. Create one to get started!</div>
              </div>
            )}
          </div>

          {/* Group Detail / Chat Window */}
          <div className='flex flex-col h-full min-h-0'>
            {!selectedGroup ? (
              <div className='card flex-grow flex flex-col items-center justify-center p-10 text-center relative overflow-hidden'>
                <div className="absolute inset-0 bg-primary-50/50 mix-blend-multiply"></div>
                <div className="relative z-10 w-24 h-24 mb-6 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <GlobeAsiaAustraliaIcon className="w-12 h-12 text-primary" />
                </div>
                <h3 className="relative z-10 text-2xl font-bold text-gray-900 mb-2">Group Hub</h3>
                <p className="relative z-10 text-gray-500 max-w-sm">Select a group from the list to view trip details, manage members, and chat.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4 min-h-0">
                {/* Group Header Info */}
                <div className='card p-6 shrink-0 bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-lg'>
                  <div className='flex items-center justify-between gap-4 flex-wrap'>
                    <div>
                      <h2 className='text-2xl font-extrabold tracking-tight'>{selectedGroup.groupName}</h2>
                      <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full mt-3'>
                        <span className="text-sm font-semibold">📍 Trip ID:</span>
                        <span className='text-sm font-mono'>{selectedGroup.tripId?.destination || selectedGroup.tripId || '—'}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      {!isMember(selectedGroup) && (
                        <button
                          className='bg-white text-primary-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95'
                          onClick={async () => {
                            await api.post(`/groups/${selectedGroup._id}/request-join`);
                            toast.success('Join request sent to group admins');
                          }}
                        >
                          Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isMember(selectedGroup) && (
                  <>
                    {/* Invite Tools */}
                    <div className='card p-5 shrink-0 border border-primary-100 bg-primary-50/30'>
                      <h3 className='font-bold text-gray-900 mb-3 flex items-center gap-2'>
                        <UserPlusIcon className="w-5 h-5 text-primary" /> Add travelers to group
                      </h3>
                      <input
                        className='input bg-white'
                        placeholder='Search for registered users by name...'
                        value={inviteQuery}
                        onChange={(e) => setInviteQuery(e.target.value)}
                      />
                      
                      {/* Invite Results (only show if typing) */}
                      {inviteQuery.trim() && (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm max-h-60 overflow-y-auto">
                          {inviteResults.length > 0 ? (
                            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                              {inviteResults.map((u) => (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                  key={u._id}
                                  className='text-left relative group'
                                  onClick={async () => {
                                    await api.post(`/groups/${selectedGroup._id}/invite`, { userId: u._id });
                                    toast.success(`Invitation sent to ${u.name}`);
                                    setInviteQuery('');
                                  }}
                                >
                                  <div className="absolute inset-0 bg-primary-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                                  <div className="group-hover:opacity-0 transition-opacity relative z-10 pointer-events-none">
                                    <UserCard user={u} online={false} />
                                  </div>
                                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold text-white text-lg drop-shadow-md">
                                    + Invite User
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          ) : (
                            <div className='text-sm text-gray-500 text-center py-2'>No users found matching "{inviteQuery}".</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chat Area (wrapped to handle height properly) */}
                    <div className="flex-grow min-h-0 relative card overflow-hidden border border-gray-200">
                      <div className="absolute inset-0">
                        <ChatBox
                          selfId={user._id}
                          messages={messages}
                          onSend={async (text) => {
                            socket.emit('group:send', { groupId: selectedGroup._id, message: text });
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {!isMember(selectedGroup) && (
                  <div className="flex-grow card flex items-center justify-center p-10 bg-gray-50/50">
                    <div className="text-center flex flex-col items-center">
                      <LockClosedIcon className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Private Group Chat</h3>
                      <p className="text-gray-500">You must be a member of this group to view the conversation and invite others.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
