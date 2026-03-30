const { db } = require('../config/firebase');

async function updateProfile(req, res) { 
  const fields = ['name', 'profileImage', 'bio', 'interests', 'budget', 'travelStyle', 'location']; 
  const updates = Object.fromEntries(fields.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]])); 
  
  try {
    const userRef = db.collection('users').doc(req.user.id);
    await userRef.update(updates);
    const updatedUser = await userRef.get();
    const data = updatedUser.data();
    delete data.password;
    res.json({ id: updatedUser.id, ...data }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
}

async function listUsers(req, res) { 
  try {
    const q = req.query.q || ''; 
    // Firestore lacks case-insensitive regex in where(). 
    // We'll fetch and filter in memory for 'listUsers' if q is provided, 
    // but limit to 30 for performance.
    const snapshot = await db.collection('users').limit(100).get();
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      delete data.password;
      return { id: doc.id, ...data };
    });

    if (q) {
      users = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));
    }
    
    res.json(users.slice(0, 30)); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
}

module.exports = { updateProfile, listUsers };

