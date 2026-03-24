import { motion } from 'framer-motion';

export default function MessageBubble({self, message, timestamp}) { 
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm relative group ${
        self 
          ? 'ml-auto bg-primary-600 text-white rounded-br-sm' 
          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
      }`}
    >
      <p className="leading-relaxed whitespace-pre-wrap word-break">{message}</p>
      <div className={`text-[10px] font-medium mt-1.5 flex items-center justify-end gap-1 ${self ? 'text-primary-100' : 'text-gray-400'}`}>
        {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        {self && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-primary-200">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </motion.div>
  ); 
}
