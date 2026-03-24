import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const stats = [
  { label: 'Trips created', value: '10,000+' },
  { label: 'Travelers matched', value: '25,000+' },
  { label: 'Avg reply time', value: '< 5 min' },
  { label: 'Active trip groups', value: '1,200+' },
];

const features = [
  { title: 'Create travel plans', desc: 'Post your dates, budget, and destination in minutes.' },
  { title: 'Smart matching', desc: 'Find travelers who align with your time and budget.' },
  { title: 'Real-time chat', desc: 'One-to-one and group conversations with timestamps.' },
  { title: 'Trip groups', desc: 'Bring everyone together with group chat and trip info.' },
];

const steps = [
  { title: 'Make a trip', desc: 'Add destination and date range (plus budget).' },
  { title: 'Match with travelers', desc: 'Search and filter to find your best fit.' },
  { title: 'Chat & coordinate', desc: 'Join groups, invite travelers, and plan together.' },
];

const destinations = [
  { name: 'Bali, Indonesia', trips: '1,240' },
  { name: 'Paris, France', trips: '980' },
  { name: 'Tokyo, Japan', trips: '860' },
  { name: 'Lisbon, Portugal', trips: '740' },
  { name: 'Santorini, Greece', trips: '620' },
  { name: 'New York City, USA', trips: '540' },
];

const testimonials = [
  { name: 'Asha', quote: 'Matched with 3 great travelers and planned everything in a week.' },
  { name: 'Marcus', quote: 'The real-time chat made coordination effortless.' },
  { name: 'Lina', quote: 'Love the group trip flow. Smooth, simple, and fast.' },
];

export default function LandingPage() {
  return (
    <div className='min-h-[calc(100vh-4rem)] flex flex-col'>
      <main className='flex-grow max-w-7xl mx-auto px-6 py-12 space-y-24 w-full'>
        {/* Hero */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className='relative rounded-[2.5rem] p-8 md:p-16 overflow-hidden bg-white border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-100/50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-secondary-100/50 blur-3xl"></div>
          
          <div className='relative z-10 grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100">
                <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                </span>
                The new standard for trip planning
              </motion.div>
              
              <motion.h1 variants={fadeUp} className='text-5xl md:text-7xl font-extrabold leading-tight text-gray-900 tracking-tight'>
                Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">travel partner</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className='text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed'>
                Create trips, match with like-minded travelers, and chat in real-time. Build your group and travel confidently around the globe.
              </motion.p>

              <motion.div variants={fadeUp} className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Link className='btn-primary text-lg px-8 py-4' to='/signup'>
                  Start Your Journey
                </Link>
                <Link className='btn-secondary text-lg px-8 py-4' to='/explore'>
                  Explore Travelers
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className='flex items-center gap-4 text-sm text-gray-500 font-medium'>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 z-${5-i} shadow-sm`}>
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full rounded-full" />
                     </div>
                  ))}
                </div>
                <span>Join 50,000+ travelers today.</span>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className='relative lg:ml-auto w-full max-w-lg perspective-1000'>
              <motion.div
                whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className='rounded-3xl bg-white shadow-2xl border border-gray-100/50 p-3 transform-style-3d'
              >
                <img src='/images/travel_hero.png' alt='TravelBuddy preview' className='w-full h-auto rounded-2xl shadow-inner' />
                
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-6 top-10 glass-panel p-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">🌴</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">New match</p>
                    <p className="text-sm font-bold text-gray-900">Bali Trip</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 10, 0] }} 
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-6 bottom-10 glass-panel p-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">✈️</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Flight booked</p>
                    <p className="text-sm font-bold text-gray-900">Tomorrow, 9 AM</p>
                  </div>
                </motion.div>

              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className='space-y-8'
        >
          <div className="text-center space-y-2">
            <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>Momentum you can feel</h2>
            <p className="text-gray-500">Join the fastest growing travel community.</p>
          </div>
          <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-6'>
            {stats.map((s) => (
              <motion.div variants={fadeUp} key={s.label} className='card card-hover p-8 text-center'>
                <div className='text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400'>{s.value}</div>
                <div className='text-sm font-medium text-gray-500 mt-3 uppercase tracking-wider'>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features & How it works - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Features */}
          <motion.section 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className='space-y-8'
          >
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-secondary-50 text-secondary-600 text-sm font-semibold tracking-wide">FEATURES</div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>Everything you need</h2>
            </div>
            <div className='grid gap-4'>
              {features.map((f) => (
                <motion.div variants={fadeUp} key={f.title} className='card card-hover p-6 flex gap-4 items-start'>
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <div className='font-bold text-gray-900 text-xl'>{f.title}</div>
                    <div className='text-gray-600 mt-2 leading-relaxed'>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className='space-y-8'
          >
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold tracking-wide">PROCESS</div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>How it works</h2>
            </div>
            <div className='space-y-6'>
              {steps.map((s, idx) => (
                <motion.div variants={fadeUp} key={s.title} className='relative pl-16'>
                  {idx !== steps.length - 1 && (
                    <div className="absolute left-[1.15rem] top-12 bottom-0 w-0.5 bg-gray-100"></div>
                  )}
                  <div className='absolute left-0 top-1 w-10 h-10 rounded-2xl bg-white border-2 border-primary-100 flex items-center justify-center text-primary-600 font-bold shadow-sm z-10'>
                    {idx + 1}
                  </div>
                  <div className="card p-6 card-hover">
                    <div className='font-bold text-gray-900 text-xl'>{s.title}</div>
                    <div className='text-gray-600 mt-2 leading-relaxed'>{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Popular destinations */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className='space-y-8'
        >
          <div className="text-center space-y-2">
            <h2 className='text-3xl font-bold text-gray-900 tracking-tight'>Popular destinations</h2>
            <p className="text-gray-500">Explore where our community is heading next.</p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {destinations.map((d) => (
              <motion.div variants={fadeUp} key={d.name} className='card card-hover p-6 group cursor-pointer relative overflow-hidden'>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className='font-bold text-xl text-gray-900'>{d.name}</div>
                <div className='text-sm text-primary-600 font-medium mt-2'>{d.trips} active trips &rarr;</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className='relative rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 shadow-2xl'
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400 opacity-20 rounded-full blur-3xl mix-blend-overlay"></div>
          
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className='text-4xl md:text-5xl font-extrabold tracking-tight'>Ready to find your buddy?</h2>
            <p className='text-primary-100 text-lg md:text-xl leading-relaxed'>
              Join thousands of travelers who have already found their perfect companion. Your next adventure starts here.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link className='bg-white text-primary-600 hover:bg-gray-50 hover:scale-105 transition-all duration-200 rounded-2xl px-8 py-4 font-bold text-lg shadow-xl' to='/signup'>
                Create Account Free
              </Link>
              <Link className='bg-primary-900/40 backdrop-blur-sm border border-white/20 hover:bg-primary-900/60 transition-all duration-200 rounded-2xl px-8 py-4 font-bold text-lg text-white' to='/login'>
                Log In
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-100 py-12 text-center text-gray-500'>
        <div className='max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-left'>
          <div>
            <div className='font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600'>TravelBuddy</div>
            <div className='text-sm mt-4 max-w-xs'>Explore together. Plan smarter. Chat faster. The modern way to coordinate group travel.</div>
          </div>
          <div>
            <div className='font-semibold text-gray-900'>Product</div>
            <ul className='mt-4 space-y-2 text-sm'>
              <li><Link to="/explore" className='hover:text-primary-600 transition'>Explore</Link></li>
              <li><Link to="/signup" className='hover:text-primary-600 transition'>Sign up</Link></li>
            </ul>
          </div>
          <div>
            <div className='font-semibold text-gray-900'>Legal</div>
            <ul className='mt-4 space-y-2 text-sm'>
              <li><a href="#" className='hover:text-primary-600 transition'>Privacy Policy</a></li>
              <li><a href="#" className='hover:text-primary-600 transition'>Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className='mt-12 pt-8 border-t border-gray-100 text-sm'>
          © {new Date().getFullYear()} TravelBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
