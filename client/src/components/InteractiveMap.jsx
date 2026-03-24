import { MapPinIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const DESTINATIONS = [
  { name: 'Bali', top: '65%', left: '75%', delay: 0 },
  { name: 'Tokyo', top: '35%', left: '82%', delay: 0.2 },
  { name: 'Paris', top: '30%', left: '48%', delay: 0.4 },
  { name: 'New York', top: '32%', left: '25%', delay: 0.6 },
  { name: 'Cape Town', top: '75%', left: '52%', delay: 0.8 },
  { name: 'Dubai', top: '45%', left: '60%', delay: 1.0 },
  { name: 'Sydney', top: '80%', left: '88%', delay: 1.2 },
  { name: 'Rio', top: '70%', left: '32%', delay: 1.4 },
];

export default function InteractiveMap({ onSelectDestination }) {
  return (
    <div className="relative w-full h-[50vh] min-h-[400px] bg-gray-900 overflow-hidden flex items-center justify-center isolate">
      {/* Premium Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(13,148,136,0.3),rgba(15,23,42,1))]" />
      
      {/* Abstract Dot Grid / World Map approximation layer */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      />

      {/* Decorative Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <path d="M 25% 32% Q 36% 15% 48% 30% T 60% 45%" fill="none" stroke="#5EEAD4" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
        <path d="M 60% 45% Q 67% 60% 75% 65% T 88% 80%" fill="none" stroke="#5EEAD4" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
      </svg>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
      `}</style>

      {/* Interactive Pins */}
      <div className="relative w-full max-w-6xl h-full mx-auto">
        {DESTINATIONS.map((dest) => (
          <motion.button
            key={dest.name}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: dest.delay, type: 'spring', stiffness: 200, damping: 15 }}
            onClick={() => onSelectDestination(dest.name)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
            style={{ top: dest.top, left: dest.left }}
          >
            {/* Pulsing ring */}
            <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-40 group-hover:opacity-70 group-hover:animate-none group-active:scale-90 transition-all" />
            
            {/* Pin itself */}
            <div className="relative w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_15px_rgba(45,212,191,0.5)] group-hover:bg-primary group-hover:border-primary-400 group-hover:scale-110 transition-all duration-300">
              <MapPinIcon className="w-5 h-5 text-accent group-hover:text-white" />
            </div>

            {/* Tooltip Label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap shadow-xl">
              {dest.name}
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="absolute bottom-10 text-center w-full pointer-events-none">
        <h2 className="text-white/40 text-sm font-bold tracking-[0.2em] uppercase">Interactive Discovery Map</h2>
      </div>
    </div>
  );
}
