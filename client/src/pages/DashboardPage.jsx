import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import TripCard from '../components/TripCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDateAsc');

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

  const enrichedTrips = useMemo(() => {
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    const getStatus = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (todaysDate < start) return 'upcoming';
      if (todaysDate > end) return 'completed';
      return 'ongoing';
    };

    return trips.map((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const status = getStatus(trip.startDate, trip.endDate);
      const daysUntilStart = Math.ceil((start - todaysDate) / (1000 * 60 * 60 * 24));

      return {
        ...trip,
        status,
        startDateObj: start,
        endDateObj: end,
        daysUntilStart
      };
    });
  }, [trips]);

  const filteredTrips = useMemo(() => {
    let result = [...enrichedTrips];

    if (statusFilter !== 'all') {
      result = result.filter((trip) => trip.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      result = result.filter(
        (trip) =>
          (trip.destination || '').toLowerCase().includes(query) ||
          (trip.description || '').toLowerCase().includes(query) ||
          (trip.tripType || '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'startDateAsc') return a.startDateObj - b.startDateObj;
      if (sortBy === 'startDateDesc') return b.startDateObj - a.startDateObj;
      if (sortBy === 'budgetAsc') return Number(a.budget || 0) - Number(b.budget || 0);
      if (sortBy === 'budgetDesc') return Number(b.budget || 0) - Number(a.budget || 0);
      if (sortBy === 'requestsDesc') return (b.joinRequests?.length || 0) - (a.joinRequests?.length || 0);
      return 0;
    });

    return result;
  }, [enrichedTrips, searchTerm, sortBy, statusFilter]);

  const dashboardStats = useMemo(() => {
    const totalTrips = enrichedTrips.length;
    const upcomingTrips = enrichedTrips.filter((trip) => trip.status === 'upcoming').length;
    const ongoingTrips = enrichedTrips.filter((trip) => trip.status === 'ongoing').length;
    const pendingRequests = enrichedTrips.reduce((acc, trip) => acc + (trip.joinRequests?.length || 0), 0);

    return { totalTrips, upcomingTrips, ongoingTrips, pendingRequests };
  }, [enrichedTrips]);

  const nextUpcomingTrip = useMemo(() => {
    return enrichedTrips
      .filter((trip) => trip.status === 'upcoming')
      .sort((a, b) => a.startDateObj - b.startDateObj)[0];
  }, [enrichedTrips]);

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
    navigate(`/trips/${trip._id || trip.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className="space-y-10">
        {/* Command Center */}
        <motion.section 
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm overflow-hidden relative text-white"
        >
          <div className="absolute -top-20 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                  <SparklesIcon className="w-4 h-4" />
                  Trip Command Center
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-3">Plan Better. Host Better. Travel Better.</h1>
                <p className="text-slate-300 mt-2">Everything important for your trips, requests, and chats in one place.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold" onClick={() => navigate('/trips/create')}>
                  <PlusIcon className="w-4 h-4" />
                  New Trip
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold" onClick={() => navigate('/groups')}>
                  <UserGroupIcon className="w-4 h-4" />
                  Groups
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold" onClick={() => navigate('/chat')}>
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Messages
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total Trips', value: dashboardStats.totalTrips },
                { label: 'Upcoming', value: dashboardStats.upcomingTrips },
                { label: 'Ongoing', value: dashboardStats.ongoingTrips },
                { label: 'Pending Requests', value: dashboardStats.pendingRequests }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-slate-300 text-sm">{stat.label}</p>
                  <p className="text-2xl font-black mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {nextUpcomingTrip && (
              <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-100/80">Next Departure</p>
                  <p className="font-bold text-lg">{nextUpcomingTrip.destination}</p>
                  <p className="text-sm text-slate-200">
                    Starts {new Date(nextUpcomingTrip.startDate).toLocaleDateString()} ({nextUpcomingTrip.daysUntilStart} day{nextUpcomingTrip.daysUntilStart === 1 ? '' : 's'} to go)
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold"
                  onClick={() => navigate(`/trips/${nextUpcomingTrip.id || nextUpcomingTrip._id}`)}
                >
                  Open Trip
                </button>
              </div>
            )}
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

          {trips.length > 0 && (
            <div className="mt-6 grid lg:grid-cols-[1fr_auto_auto] gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-10 bg-white"
                  placeholder="Search destination, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input bg-white min-w-[180px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <select
                className="input bg-white min-w-[220px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="startDateAsc">Sort: Start Date (Soonest)</option>
                <option value="startDateDesc">Sort: Start Date (Latest)</option>
                <option value="budgetAsc">Sort: Budget (Low to High)</option>
                <option value="budgetDesc">Sort: Budget (High to Low)</option>
                <option value="requestsDesc">Sort: Most Join Requests</option>
              </select>
            </div>
          )}

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
            ) : filteredTrips.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card p-12 text-center text-gray-500'>
                <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                  <CalendarDaysIcon className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No trips match your filters</h3>
                <p className="mt-2">Try changing search text, status filter, or sort options.</p>
                <button
                  className="btn-secondary mt-5"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSortBy('startDateAsc');
                  }}
                >
                  Clear Filters
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
                  {filteredTrips.map((t) => (
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
      </div>
    </div>
  );
}
