import { motion } from 'framer-motion';
import { CalendarIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function TripCard({ trip, onEdit, onDelete, onManageRequests }) { 
  return (
    <div className='card overflow-hidden flex flex-col h-full group'>
      {/* Image Header */}
      <div className="h-32 bg-gray-100 relative shrink-0">
        <img src={trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="inline-flex items-center justify-center px-2 py-0.5 mb-1 rounded-full bg-primary-500/80 backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase">
            {trip.tripType || 'ADVENTURE'}
          </div>
          <h3 className='font-bold text-lg leading-tight truncate'>{trip.destination}</h3>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className='text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-3'>
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </div>
        <p className='text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-2'>{trip.description}</p>
        
        {/* Members Avatars */}
        {trip.members?.length > 0 && (
          <div className="flex items-center mb-4 mt-auto">
            <div className="flex -space-x-2 mr-2">
              {trip.members.slice(0, 3).map((m, i) => (
                <img key={i} src={m.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`} alt={m.name} className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-gray-100 object-cover bg-white" title={m.name}/>
              ))}
            </div>
            {trip.members.length > 3 && <span className="text-xs font-semibold text-gray-500">+{trip.members.length - 3}</span>}
          </div>
        )}

        <div className="flex bg-gray-50 -mx-5 -mb-5 p-3.5 mt-auto border-t border-gray-100 items-center justify-between">
          <div className='text-green-600 font-bold text-sm tracking-tight'>
            ${trip.budget}
          </div>
          <div className='flex items-center gap-1'>
            {trip.joinRequests?.length > 0 && (
              <button className='text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors flex items-center gap-1 mr-1 shadow-sm' onClick={() => onManageRequests?.(trip)}>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {trip.joinRequests.length} Requests
              </button>
            )}
            <button className='p-1.5 text-gray-400 hover:text-primary-600 transition-colors' onClick={() => onEdit?.(trip)} title="Edit Trip"><PencilSquareIcon className="w-5 h-5"/></button>
            <button className='p-1.5 text-gray-400 hover:text-red-600 transition-colors' onClick={() => onDelete?.(trip._id)} title="Delete Trip"><TrashIcon className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </div>
  ); 
}
