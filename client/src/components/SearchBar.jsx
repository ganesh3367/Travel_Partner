import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({value,onChange}){ 
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input 
        className='input pl-11 py-3 bg-white shadow-sm border-gray-100 focus:ring-primary focus:border-primary transition-shadow w-full rounded-2xl' 
        value={value} 
        onChange={(e)=>onChange(e.target.value)} 
        placeholder='Search destinations...' 
      />
    </div>
  ); 
}
