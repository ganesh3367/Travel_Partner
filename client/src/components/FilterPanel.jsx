import { CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function FilterPanel({ filters, setFilters }) {
  return (
    <div className='card p-5 space-y-6 bg-white shadow-sm border border-gray-100 rounded-3xl'>
      <div>
        <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Availability</label>
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              className='input pl-9 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 w-full transition-all rounded-xl'
              type='date'
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              className='input pl-9 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 w-full transition-all rounded-xl'
              type='date'
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Budget Range</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              className='input pl-8 py-2.5 text-sm font-bold text-gray-900 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 w-full transition-all rounded-xl'
              type='number'
              placeholder='Min'
              value={filters.budgetMin || ''}
              onChange={(e) => setFilters((f) => ({ ...f, budgetMin: e.target.value }))}
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-4 w-4 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              className='input pl-8 py-2.5 text-sm font-bold text-gray-900 bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 w-full transition-all rounded-xl'
              type='number'
              placeholder='Max'
              value={filters.budgetMax || ''}
              onChange={(e) => setFilters((f) => ({ ...f, budgetMax: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
