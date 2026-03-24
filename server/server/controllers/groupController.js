const Group = require('../models/Group');
const Trip = require('../models/Trip');

async function createGroup(req, res) { 
  try {
    const { name, description, tripId } = req.body; 
    if (tripId) { 
      const trip = await Trip.findById(tripId); 
      if (!trip) return res.status(404).json({message: 'Trip not found'}); 
    } 
    const group = await Group.create({ name, description, trip: tripId, members: [req.user._id], admins: [req.user._id] }); 
    res.status(201).json(group); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating group' });
  }
}

async function getGroups(req, res) { 
  try {
    const groups = await Group.find({ members: req.user._id }).populate('trip').sort('-createdAt'); 
    res.json(groups); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching groups' });
  }
}

async function joinGroup(req, res) { 
  try {
    const group = await Group.findById(req.params.id); 
    if (!group) return res.status(404).json({message: 'Group not found'}); 
    if (!group.members.includes(req.user._id)) { 
      group.members.push(req.user._id); 
      await group.save(); 
    } 
    res.json(group); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error joining group' });
  }
}

async function getGroupDetails(req, res) { 
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name profileImage').populate('messages').populate('trip'); 
    if (!group) return res.status(404).json({message: 'Group not found'}); 
    res.json(group); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching group details' });
  }
}

module.exports = { createGroup, getGroups, joinGroup, getGroupDetails };
