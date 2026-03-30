import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import TripCard from '../components/TripCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { CheckIcon, XMarkIcon, MapIcon } from '@heroicons/react/24/solid';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [manageOpen, setManageOpen] = useState(false);
  const [managingTrip, setManagingTrip] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    tripType: '',
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trips/mine');
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (trip) => {
    setEditingId(trip._id || trip.id);
    setEditForm({
      destination: trip.destination || '',
      startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : '',
      endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : '',
      budget: trip.budget ?? '',
      description: trip.description || '',
      tripType: trip.tripType || 'leisure',
    });
    setEditOpen(true);
  };

  const openManageRequests = (trip) => {
    setManagingTrip(trip);
    setManageOpen(true);
  };

  const handleRequest = async (tripId, requesterId, action) => {
    try {
      const { data } = await api.patch(`/trips/${tripId}/respond`, { action, requesterId });
      toast.success(action === 'accept' ? 'Request accepted!' : 'Request declined');
      setManagingTrip(data);
      setTrips(prev => prev.map(t => (t._id || t.id) === tripId ? data : t));
      if (data.joinRequests?.length === 0) setManageOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className="space-y-10">
        {/* Process Guide - How it Works */}
        <motion.section 
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0V9m0 6l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              How TravelBuddy Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Make a Trip', desc: 'Post your destination, dates, and budget in minutes.', icon: '✍️' },
                { step: 2, title: 'Match Travelers', desc: 'Find explorers who align with your time and style.', icon: '🔍' },
                { step: 3, title: 'Chat & Coordinate', desc: 'Join squad groups and plan every detail together.', icon: '💬' }
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="absolute -left-4 -top-4 text-4xl font-black text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">0{item.step}</div>
                  <div className="relative">
                    <div className="text-3xl mb-4 text-gray-900">{item.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section>
          <div className='flex items-center justify-between gap-4 flex-wrap bg-white p-6 rounded-3xl shadow-sm border border-gray-100'>
            <div>
              <h1 className='text-3xl font-extrabold tracking-tight text-gray-900'>My Trips</h1>
              <p className="text-gray-500 mt-1">Manage your planned adventures</p>
            </div>
            <button className='btn-primary shadow-xl shadow-primary-500/20' onClick={() => navigate('/trips/create')}>
              + Create New Trip
            </button>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center p-12"><Loader /></div>
            ) : trips.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card p-16 text-center text-gray-500 flex flex-col items-center gap-6 bg-white border-2 border-dashed border-gray-100'>
                <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center text-4xl shadow-inner">
                  🌵
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">No trips planned yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">Ready to start your next adventure? Create your first trip now and find travelers.</p>
                </div>
                <button className='btn-primary px-10 py-4 text-lg shadow-xl shadow-primary-500/20' onClick={() => navigate('/trips/create')}>
                  Start Your First Trip
                </button>
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer} 
                initial="hidden" 
                animate="visible" 
                className='grid lg:grid-cols-2 xl:grid-cols-3 gap-6'
              >
                <AnimatePresence>
                  {trips.map((t) => (
                    <motion.div variants={fadeUp} key={t._id || t.id} layout exit={{ opacity: 0, scale: 0.9 }}>
                      <TripCard
                        trip={t}
                        onEdit={openEdit}
                        onManageRequests={openManageRequests}
                        onDelete={async (id) => {
                          if (window.confirm("Are you sure you want to delete this trip?")) {
                            await api.delete(`/trips/${id}`);
                            toast.success('Trip deleted');
                            load();
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

        <Modal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditingId(null);
          }}
        >
          <form
            className='space-y-5 p-2'
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.patch(`/trips/${editingId}`, editForm);
                toast.success('Trip updated successfully');
                setEditOpen(false);
                setEditingId(null);
                await load();
              } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to update trip');
              }
            }}
          >
            <div>
              <h2 className='text-2xl font-extrabold text-gray-900'>Edit Trip Idea</h2>
              <p className="text-gray-500 text-sm mt-1">Update your travel plans</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination</label>
                <input
                  className='input'
                  placeholder='E.g. Paris, France'
                  value={editForm.destination}
                  onChange={(e) => setEditForm((f) => ({ ...f, destination: e.target.value }))}
                />
              </div>
              
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    className='input'
                    type='date'
                    value={editForm.startDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input
                    className='input'
                    type='date'
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget ($)</label>
                  <input
                    className='input'
                    type='number'
                    placeholder='E.g. 1500'
                    value={editForm.budget}
                    onChange={(e) => setEditForm((f) => ({ ...f, budget: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Type</label>
                  <input
                    className='input'
                    placeholder='E.g. leisure, adventure'
                    value={editForm.tripType}
                    onChange={(e) => setEditForm((f) => ({ ...f, tripType: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  className='input min-h-[100px] resize-y'
                  placeholder='What are you looking forward to?'
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" className='btn-secondary flex-1' onClick={() => setEditOpen(false)}>Cancel</button>
              <button type="submit" className='btn-primary flex-1'>Save Changes</button>
            </div>
          </form>
        </Modal>

        {/* Manage Requests Modal */}
        <Modal open={manageOpen} onClose={() => { setManageOpen(false); setManagingTrip(null); }}>
          <div className="p-2 space-y-6">
            <div>
              <h2 className='text-2xl font-extrabold text-gray-900'>Join Requests</h2>
              <p className="text-gray-500 text-sm mt-1">Travelers wanting to join your trip to {managingTrip?.destination}</p>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {managingTrip?.joinRequests?.map(reqUser => (
                <div key={reqUser._id || reqUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <img src={reqUser.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${reqUser.name}`} alt={reqUser.name} className="w-12 h-12 rounded-full border border-gray-200 bg-white" />
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{reqUser.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{reqUser.bio || "No bio available."}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRequest(managingTrip._id || managingTrip.id, reqUser._id || reqUser.id, 'accept')} className="w-10 h-10 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center transition-colors" title="Accept"><CheckIcon className="w-6 h-6"/></button>
                    <button onClick={() => handleRequest(managingTrip._id || managingTrip.id, reqUser._id || reqUser.id, 'reject')} className="w-10 h-10 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center transition-colors" title="Decline"><XMarkIcon className="w-6 h-6"/></button>
                  </div>
                </div>
              ))}
              {(!managingTrip?.joinRequests || managingTrip.joinRequests.length === 0) && (
                <div className="text-center p-8 text-gray-500">No pending requests right now.</div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
