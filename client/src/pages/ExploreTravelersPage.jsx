import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import UserCard from '../components/UserCard';
import InteractiveMap from '../components/InteractiveMap';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

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

export default function ExploreTravelersPage() {
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', budgetMin: 0, budgetMax: 5000 });
  const [travelers, setTravelers] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 8;
  const debounced = useDebounce(q);

  useEffect(() => {
    setPage(1);
  }, [debounced, filters.startDate, filters.endDate, filters.budgetMin, filters.budgetMax]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get('/match', {
          params: {
            destination: debounced,
            budgetMin: filters.budgetMin,
            budgetMax: filters.budgetMax,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            page,
            limit,
          },
        });
        if (cancelled) return;
        setTravelers(res.data.travelers || []);
        setTotalTrips(res.data.totalTrips || 0);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load matches');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [debounced, filters, page]);

  const totalPages = Math.max(1, Math.ceil(totalTrips / limit));

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col relative pb-32">
      
      {/* Immersive Map Header */}
      <div className="relative w-full">
        <InteractiveMap onSelectDestination={(dest) => setQ(dest)} />
        
        {/* Floating Top Search Bar */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20 shadow-2xl shadow-black/20 rounded-3xl">
          <SearchBar value={q} onChange={setQ} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 flex-1">
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4 sticky top-6">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>

          <div className="lg:col-span-3 space-y-6 pt-2">
            {loading ? (
              <div className='grid sm:grid-cols-2 gap-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='card p-4 animate-pulse h-40 bg-gray-50' />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer} 
                initial="hidden" 
                animate="visible" 
                className='grid sm:grid-cols-2 gap-4'
              >
                {travelers.map((u) => (
                  <motion.div variants={fadeUp} key={u._id}>
                    <UserCard user={u} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && travelers.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card p-12 text-center text-gray-500 flex flex-col items-center gap-4 bg-white/50 border-dashed border-2 border-gray-200'>
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center ring-4 ring-white shadow-sm">
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">No matches found for your criteria.</p>
                <button onClick={() => { setQ(''); setFilters({ startDate: '', endDate: '', budgetMin: 0, budgetMax: 5000 }) }} className="btn-secondary text-sm bg-white shadow-sm hover:shadow-md transition-shadow">Clear Filters</button>
              </motion.div>
            )}

            <div className='flex items-center justify-between gap-3 pt-6 border-t border-gray-100'>
              <button
                className='btn-secondary !p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white shadow-sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div className='text-sm font-bold text-gray-700 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100'>Page {page} of {totalPages}</div>
              <button
                className='btn-secondary !p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white shadow-sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
