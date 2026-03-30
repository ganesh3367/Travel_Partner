const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { generateToken } = require('../utils/generateToken');

async function signup(req, res) { 
  const { name, email, password } = req.body; 
  if (!name || !email || !password) return res.status(400).json({message:'Missing required fields'}); 
  
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) return res.status(409).json({message:'Email already exists'}); 

    const hash = await bcrypt.hash(password, 10); 
    const newUser = {
      name, 
      email, 
      password: hash,
      profileImage: '',
      bio: '',
      interests: [],
      budget: 0,
      travelStyle: '',
      location: '',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('users').add(newUser);
    const token = generateToken(docRef.id); 
    
    res.status(201).json({
      token, 
      user: { id: docRef.id, ...newUser, password: undefined }
    }); 
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) { 
  const { email, password } = req.body; 
  if (!email || !password) return res.status(400).json({message: 'Missing required fields'});

  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) return res.status(401).json({message:'Invalid credentials'}); 
    
    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    
    const ok = await bcrypt.compare(password, user.password); 
    if (!ok) return res.status(401).json({message:'Invalid credentials'}); 
    
    const token = generateToken(user.id); 
    res.json({token, user: { ...user, password: undefined }}); 
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function me(req, res) { 
  res.json(req.user); 
}

module.exports = { signup, login, me };

