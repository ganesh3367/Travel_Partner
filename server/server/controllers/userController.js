const User = require('../models/User');

async function updateProfile(req, res) { 
  const fields = ['name', 'profileImage', 'bio', 'interests', 'budget', 'travelStyle', 'location']; 
  const updates = Object.fromEntries(fields.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]])); 
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password'); 
  res.json(user); 
}

async function listUsers(req, res) { 
  const q = req.query.q || ''; 
  const users = await User.find({ name: { $regex: q, $options: 'i' } }).select('-password').limit(30); 
  res.json(users); 
}

module.exports = { updateProfile, listUsers };
