import { motion } from 'framer-motion';

export default function UserCard({ user, online }) { 
  return (
    <div className='card card-hover p-5'>
      <div className='flex items-center gap-4'>
        <div className="relative shrink-0">
          <img 
            src={user.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} 
            alt='avatar' 
            className='w-14 h-14 rounded-full object-cover p-1 bg-white border-2 border-primary-100 shadow-sm' 
          />
          {online && (
            <span className='absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-white shadow-sm' />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className='font-bold text-gray-900 text-lg truncate leading-tight'>{user.name}</p>
          <p className='text-sm font-medium text-primary-600 truncate bg-primary-50 inline-block px-2 py-0.5 rounded-lg mt-1'>{user.location || 'Location Unknown'}</p>
        </div>
      </div>
      
      <p className='text-sm text-gray-600 mt-4 leading-relaxed line-clamp-2'>
        {user.bio || 'This traveler prefers to keep their bio mysterious. Reach out to learn more!'}
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
        <button className="btn-secondary py-1.5 px-4 text-sm">View Profile</button>
        <button className="btn-primary py-1.5 px-4 text-sm shadow-md">Message</button>
      </div>
    </div>
  ); 
}
