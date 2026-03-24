import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CreateTripPage() {
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    tripType: 'leisure',
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>Plan a New Adventure</h1>
          <p className="text-gray-500">Fill in the details below to start finding travel buddies.</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='card p-8 md:p-10 space-y-6 shadow-xl shadow-gray-200/50'
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post('/trips', form);
            toast.success('Trip created successfully');
            setForm({ destination: '', startDate: '', endDate: '', budget: '', description: '', tripType: 'leisure' });
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Where are you going?</label>
              <input 
                className='input text-lg py-4' 
                placeholder='E.g. Bali, Indonesia or Tokyo, Japan' 
                value={form.destination} 
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} 
                required
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input 
                  className='input' 
                  type='date' 
                  value={form.startDate} 
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input 
                  className='input' 
                  type='date' 
                  value={form.endDate} 
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} 
                  required
                />
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Budget (USD)</label>
                <input 
                  className='input' 
                  type='number' 
                  placeholder='E.g. 1500' 
                  value={form.budget} 
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Type</label>
                <select
                  className='input appearance-none bg-white'
                  value={form.tripType}
                  onChange={(e) => setForm((f) => ({ ...f, tripType: e.target.value }))}
                >
                  <option value='leisure'>Leisure & Relaxation</option>
                  <option value='adventure'>Adventure & Outdoors</option>
                  <option value='business'>Business & Work</option>
                  <option value='family'>Family Vacation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description & Expectations</label>
              <textarea 
                className='input min-h-[120px] resize-y' 
                placeholder='What do you want to do on this trip? What kind of travel partner are you looking for?' 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button className='btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/30'>
              Publish Trip
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
