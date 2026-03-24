const User = require('../models/User');

async function getMatches(req, res) { 
  try {
    const me = req.user; 
    const query = { _id: { $ne: me._id } }; 
    if (me.location) query.location = { $regex: me.location, $options: 'i' }; 
    if (me.travelStyle) query.travelStyle = me.travelStyle; 
    if (me.budget) query.budget = me.budget; 

    const matches = await User.find(query).select('name profileImage bio location travelStyle budget').limit(20); 
    res.json(matches); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
}

module.exports = { getMatches };
