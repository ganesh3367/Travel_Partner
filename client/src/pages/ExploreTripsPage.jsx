import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarDaysIcon, BanknotesIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

export default function ExploreTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trips/explore');
      setTrips(data);
    } catch (err) {
      toast.error('Failed to load adventures');
    } finally {
      setLoading(false);
    }
  };

  const requestJoin = async (id) => {
    try {
      await api.patch(`/trips/${id}/request`);
      toast.success('Wait for host approval! ✨');
      const userId = user.id || user._id;
      setTrips(prev => prev.map(t => 
        (t.id || t._id) === id ? { ...t, joinRequests: [...(t.joinRequests || []), userId] } : t
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request');
    }
  };

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.destination.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || (t.tripType && t.tripType.toLowerCase() === activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 h-[80vh]">
      <Loader />
      <p className="mt-4 text-gray-400 font-medium animate-pulse">Scouting the best adventures...</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 px-8 py-16 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.2),transparent)]"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-accent text-xs font-bold uppercase tracking-widest mb-6"
          >
            <SparklesIcon className="w-4 h-4" />
            Discover New Horizons
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent">Great Adventure</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400 text-lg"
          >
            Join like-minded travelers across the globe. From weekend getaways to month-long expeditions.
          </motion.p>
        </div>

        {/* Search Bar - Integrated in Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4 items-center"
        >
          <div className="relative flex-1 min-w-[300px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by destination (e.g. Bali, Paris)..."
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl">
            {['All', 'Leisure', 'Adventure', 'Culture'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === filter ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Results Grid */}
      <AnimatePresence mode='wait'>
        {filteredTrips.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FunnelIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No such adventures yet</h3>
            <p className="text-gray-500 max-w-xs mt-2">We couldn't find any trips matching your search. Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(''); setActiveFilter('All'); }} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12"
          >
            {filteredTrips.map(trip => {
              const tripId = trip.id || trip._id;
              const userId = user.id || user._id;
              const hasRequested = trip.joinRequests?.includes(userId);
              const isMember = trip.members?.includes(userId);
              
              return (
                <motion.div 
                  key={tripId} 
                  variants={cardVariants}
                  className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'} 
                      alt={trip.destination} 
                      className="w-full h-full object-cover transition-transform duration-700 grow group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                        {trip.tripType || 'Exploration'}
                      </span>
                      {isMember && (
                        <span className="px-3 py-1.5 bg-accent text-dark text-[10px] font-black rounded-xl shadow-lg animate-pulse">
                          ✓ ENROLLED
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-5 left-6 right-6">
                      <div className="flex items-center gap-2 text-white/90 text-xs font-bold mb-1">
                        <MapPinIcon className="w-4 h-4 text-accent" />
                        <span className="tracking-wide uppercase">Destination</span>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md truncate">
                        {trip.destination}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow space-y-6">
                    {/* Host Info */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          const hostId = trip.userId?.id || trip.userId?._id;
                          if (hostId) navigate('/chat', { state: { userId: hostId } });
                        }}
                      >
                        <div className="relative">
                          <img 
                            src={trip.userId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${trip.userId?.name || 'Explorer'}`} 
                            alt={trip.userId?.name} 
                            className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-100 shadow-sm object-cover"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate tracking-tight">{trip.userId?.name || 'Explorer'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            Host <span className="text-primary-500 text-[8px]">• Message</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary-600 font-black">
                          <BanknotesIcon className="w-4 h-4" />
                          <span className="text-lg">${trip.budget || 0}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Budget</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="relative">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic">
                        "{trip.description || "Looking for amazing travelers to share experiences and explore the hidden gems of this destination together!"}"
                      </p>
                    </div>

                    {/* Trip Details Bar */}
                    <div className="flex items-center gap-4 py-3 border-y border-gray-50">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <CalendarDaysIcon className="w-5 h-5 text-gray-300 shrink-0" />
                        <span className="text-xs font-bold text-gray-500 truncate lowercase">
                          {new Date(trip.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="h-4 w-px bg-gray-100"></div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase">+{trip.members?.length || 0}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                      {isMember ? (
                        <button disabled className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs cursor-not-allowed border border-gray-100">
                          Joined
                        </button>
                      ) : hasRequested ? (
                        <button disabled className="w-full py-4 bg-primary-50 text-primary-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-inner border border-primary-100/50">
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                          Pending Approval
                        </button>
                      ) : (
                        <button 
                          onClick={() => requestJoin(tripId)} 
                          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 group-hover:bg-primary group-hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Request Space
                          <SparklesIcon className="w-4 h-4 text-accent animate-bounce" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
