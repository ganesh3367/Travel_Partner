import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExploreTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/trips/explore')
      .then(r => setTrips(r.data))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const requestJoin = async (id) => {
    try {
      await api.patch(`/trips/${id}/request`);
      toast.success('Join request sent!');
      setTrips(prev => prev.map(t => 
        t._id === id ? { ...t, joinRequests: [...(t.joinRequests || []), user._id] } : t
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request');
    }
  };

  if (loading) return <div className="flex justify-center p-12 h-screen"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Find Trips</h1>
          <p className="text-gray-500 mt-1">Discover and join upcoming adventures created by the community.</p>
        </div>

        {trips.length === 0 ? (
          <div className="text-center p-12 card text-gray-500">No upcoming trips available. Be the first to create one!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => {
              const hasRequested = trip.joinRequests?.includes(user._id);
              const isMember = trip.members?.includes(user._id);
              
              return (
                <motion.div key={trip._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card card-hover flex flex-col group overflow-hidden border-0 ring-1 ring-gray-100/50 bg-white">
                  <div className="h-56 relative shrink-0 overflow-hidden bg-gray-100">
                    <img src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      {isMember && <span className="bg-accent text-dark text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg tracking-wider">✓ JOINED</span>}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white font-bold text-[10px] tracking-widest uppercase mb-2 shadow-sm border border-white/20">
                        {trip.tripType || 'ADVENTURE'}
                      </div>
                      <h3 className="font-extrabold text-2xl text-white drop-shadow-md truncate">{trip.destination}</h3>
                      <p className="text-white/90 text-sm font-medium drop-shadow flex items-center gap-1.5 mt-1">
                        🗓️ {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 space-y-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3">
                      <img src={trip.userId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${trip.userId?.name || 'Traveler'}`} alt={trip.userId?.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 bg-gray-50 object-cover" />
                      <div className="overflow-hidden min-w-0">
                        <p className="text-sm font-extrabold text-dark truncate">{trip.userId?.name || 'Unknown Explorer'}</p>
                        <p className="text-xs text-graytext flex items-center gap-1 truncate">📍 {trip.userId?.location || typeof trip.userId?.location === 'string' ? trip.userId.location : 'Global Citizen'}</p>
                      </div>
                    </div>
                    <p className="text-graytext text-sm leading-relaxed line-clamp-3">"{trip.description || "Join me on this exciting journey! Looking for like-minded travelers to explore and create unforgettable memories."}"</p>
                    
                    <div className="pt-5 mt-auto border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-graytext font-bold uppercase tracking-widest">Est. Budget</span>
                        <span className="font-extrabold text-xl text-primary tracking-tight">${trip.budget || 0}</span>
                      </div>
                      {isMember ? (
                        <button disabled className="btn-secondary opacity-50 px-6 py-2.5 cursor-not-allowed">Already Joined</button>
                      ) : hasRequested ? (
                        <button disabled className="btn-secondary text-primary bg-primary/10 border-primary/20 opacity-100 px-6 py-2.5 font-bold flex items-center gap-2 shadow-inner">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          Requested
                        </button>
                      ) : (
                        <button onClick={() => requestJoin(trip._id)} className="btn-primary px-6 py-2.5 shadow-primary/30 font-bold hover:-translate-y-0.5">Request to Join</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
