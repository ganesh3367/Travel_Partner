import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage(){ 
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    profileImage: '',
    bio: '',
    interests: '',
    budget: '',
    travelStyle: '',
    location: ''
  }); 

  useEffect(() => {
    if (user) {
      setForm({
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        interests: user.interests ? user.interests.join(', ') : '',
        budget: user.budget || '',
        travelStyle: user.travelStyle || '',
        location: user.location || ''
      });
    }
  }, [user]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Your Profile</h1>
            <p className="text-gray-500 mt-1">Manage your public persona and travel preferences</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center shadow-inner overflow-hidden border-2 border-primary-100">
            {form.profileImage ? (
              <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-primary-400" />
            )}
          </div>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='card p-8 min-h-[500px] flex flex-col' 
          onSubmit={async (e) => {
            e.preventDefault(); 
            setLoading(true);
            try {
              const { data } = await api.patch('/users/profile', {
                ...form,
                interests: form.interests.split(',').map((x) => x.trim()).filter(Boolean)
              });
              if (setUser) setUser(data);
              toast.success('Profile updated successfully!');
            } catch (err) {
              toast.error(err?.response?.data?.message || 'Failed to update profile');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-6 flex-grow">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Info</h2>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image URL</label>
                <input className='input' placeholder='https://example.com/photo.jpg' value={form.profileImage} onChange={(e)=>setForm({...form,profileImage:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input className='input' placeholder='City, Country' value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">About You (Bio)</label>
              <textarea className='input min-h-[100px] resize-y' placeholder='Tell other travelers about yourself...' value={form.bio} onChange={(e)=>setForm({...form,bio:e.target.value})}/>
            </div>

            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mt-8">Travel Preferences</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Interests & Hobbies</label>
              <input className='input' placeholder='Hiking, Photography, Food (Comma separated)' value={form.interests} onChange={(e)=>setForm({...form,interests:e.target.value})}/>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Helps us match you with compatible companions.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Typical Budget (USD)</label>
                <input className='input' placeholder='E.g. 1000' type='number' value={form.budget} onChange={(e)=>setForm({...form,budget:e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Travel Style</label>
                <select className='input appearance-none bg-white' value={form.travelStyle} onChange={(e)=>setForm({...form,travelStyle:e.target.value})}>
                  <option value=''>Select a style...</option>
                  <option value='budget'>Backpacker / Budget</option>
                  <option value='comfort'>Comfort / Mid-range</option>
                  <option value='luxury'>Luxury</option>
                  <option value='adventure'>Adventure Focused</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className='flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors'
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Sign Out
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              className='btn-primary px-8 shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 transition-all'
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  ); 
}
