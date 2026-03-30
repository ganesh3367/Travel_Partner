const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await db.collection('users').doc(payload.id).get();
    
    if (!userDoc.exists) return res.status(401).json({ message: 'Invalid token user' });
    
    req.user = { id: userDoc.id, ...userDoc.data() };
    delete req.user.password;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { protect };

