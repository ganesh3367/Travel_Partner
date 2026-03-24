const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

async function signup(req, res) { 
  const { name, email, password } = req.body; 
  if (!name || !email || !password) return res.status(400).json({message:'Missing required fields'}); 
  const exists = await User.findOne({email}); 
  if (exists) return res.status(409).json({message:'Email already exists'}); 
  
  try {
    const hash = await bcrypt.hash(password, 10); 
    const user = await User.create({name, email, password: hash}); 
    const token = generateToken(user._id); 
    res.status(201).json({token, user: {...user.toObject(), password: undefined}}); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) { 
  const { email, password } = req.body; 
  const user = await User.findOne({email}); 
  if (!user) return res.status(401).json({message:'Invalid credentials'}); 
  const ok = await bcrypt.compare(password, user.password); 
  if (!ok) return res.status(401).json({message:'Invalid credentials'}); 
  const token = generateToken(user._id); 
  res.json({token, user: {...user.toObject(), password: undefined}}); 
}

function me(req, res) { 
  res.json(req.user); 
}

module.exports = { signup, login, me };
