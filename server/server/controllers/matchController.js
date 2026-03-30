const { db } = require('../config/firebase');

async function getMatches(req, res) { 
  try {
    const me = req.user; 
    const { destination, page = 1, limit = 8 } = req.query;
    
    const snapshot = await db.collection('users').limit(100).get();
    
    let allUsers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.id !== me.id); 

    let matches = [...allUsers];

    // Priority 1: Destination/Location Search (Direct from UI query)
    if (destination) {
      const q = destination.toLowerCase();
      matches = matches.filter(u => 
        (u.location && u.location.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q))
      );
    }
    
    // Priority 2: Smart Match by user's own location/style/budget
    if (!destination) {
      if (me.location) {
        const loc = me.location.toLowerCase();
        const locMatches = matches.filter(u => u.location && u.location.toLowerCase().includes(loc));
        if (locMatches.length > 5) matches = locMatches;
      }
      
      if (me.travelStyle) {
        const styleMatches = matches.filter(u => u.travelStyle === me.travelStyle);
        if (styleMatches.length > 5) matches = styleMatches;
      }
    }

    const totalTrips = matches.length; // Using 'totalTrips' key as expected by frontend paging
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedMatches = matches.slice(startIndex, startIndex + Number(limit));

    const travelers = paginatedMatches.map(u => ({
      id: u.id,
      name: u.name,
      profileImage: u.profileImage,
      bio: u.bio,
      location: u.location || 'Exploring',
      travelStyle: u.travelStyle || 'Leisure',
      budget: u.budget || 0
    }));

    res.json({ travelers, totalTrips }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
}

module.exports = { getMatches };

