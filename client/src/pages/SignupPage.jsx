import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function SignupPage() { 
  const { signup } = useAuth(); 
  const nav = useNavigate(); 
  const [form, setForm] = useState({ name: '', email: '', password: '' }); 

  return (
    <div className='min-h-[calc(100vh-4rem)] grid md:grid-cols-2 bg-white'>
      {/* Left side - Image/Branding */}
      <div className='hidden md:flex flex-col justify-between bg-primary-900 p-12 text-white relative overflow-hidden order-last'>
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary-600 to-primary-600 opacity-90 z-0"></div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay z-0 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400 opacity-20 rounded-full blur-3xl mix-blend-overlay z-0 -translate-x-1/3 translate-y-1/3"></div>

        <Link to='/' className='relative z-10 font-bold text-2xl tracking-tight flex items-center gap-2 group w-max'>
          <div className='w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform'>
            T
          </div>
          TravelBuddy
        </Link>

        <div className='relative z-10 max-w-sm'>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className='text-4xl font-extrabold leading-tight mb-6'
          >
            Start your journey with us.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className='text-primary-100 text-lg'
          >
            Join a community of 50,000+ travelers. Find your perfect match and plan unforgettable trips.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className='flex items-center justify-center p-8 sm:p-12 relative'>
        {/* Mobile back button & logo */}
        <div className='md:hidden absolute top-6 left-6'>
          <Link to='/' className='font-bold text-xl tracking-tight text-primary-600'>TravelBuddy</Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className='w-full max-w-md space-y-8'
        >
          <div>
            <h1 className='text-3xl font-extrabold text-gray-900'>Create Account</h1>
            <p className='mt-2 text-gray-500'>Sign up in seconds to start planning your next trip.</p>
          </div>

          <form 
            className='space-y-5' 
            onSubmit={async (e) => {
              e.preventDefault(); 
              await signup(form); 
              nav('/dashboard');
            }}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Full Name</label>
                <input 
                  className='input' 
                  placeholder='Alex Wanderer' 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
                <input 
                  className='input' 
                  type='email'
                  placeholder='hello@example.com' 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Password</label>
                <input 
                  className='input' 
                  type='password' 
                  placeholder='Create a strong password' 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required
                />
              </div>
            </div>

            <button className='btn-primary w-full py-3 text-lg mt-6 shadow-xl shadow-primary-500/20'>
              Create my account
            </button>
          </form>

          <p className='text-center text-sm text-gray-600 mt-8'>
            Already have an account?{' '}
            <Link to='/login' className='font-bold text-primary-600 hover:text-primary-700 transition-colors'>
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  ); 
}
