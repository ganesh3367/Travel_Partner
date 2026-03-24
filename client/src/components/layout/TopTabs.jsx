import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TopTabs() {
  const { pathname } = useLocation();

  const tabs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Find Trips', path: '/trips/explore' },
    { label: 'Find Travelers', path: '/explore' },
    { label: 'Create Trip', path: '/trips/create' },
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 z-10 shrink-0">
      <div className="flex space-x-8 -mb-px overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/dashboard' && pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`whitespace-nowrap py-3.5 px-1 font-bold text-sm transition-colors relative ${isActive ? 'text-primary' : 'text-graytext hover:text-dark'}`}
            >
              {tab.label}
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
