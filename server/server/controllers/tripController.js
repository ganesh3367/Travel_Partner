const Trip = require('../models/Trip');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

const placeholders = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
];

async function createTrip(req, res) { 
  try {
    const imageUrl = placeholders[Math.floor(Math.random() * placeholders.length)] + '?auto=format&fit=crop&w=800&q=80';
    const trip = await Trip.create({ ...req.body, userId: req.user._id, imageUrl });
    
    // Automatically spin up a Group Chat for this trip
    await Group.create({ 
      groupName: `${trip.destination} Squad`, 
      tripId: trip._id, 
      members: [req.user._id] 
    });

    res.status(201).json(trip); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating trip' });
  }
}

async function getTrips(req, res) { 
  try {
    const query = {};
    if (req.query.destination) query.destination = { $regex: req.query.destination, $options: 'i' }; 
    const trips = await Trip.find(query).populate('userId', 'name profileImage').sort('-createdAt'); 
    res.json(trips); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching trips' });
  }
}

async function getTripById(req, res) { 
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('userId', 'name profileImage bio')
      .populate('members', 'name profileImage')
      .populate('joinRequests', 'name profileImage bio');
    if (!trip) return res.status(404).json({message: 'Trip not found'});  
    res.json(trip); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching trip details' });
  }
}

async function myTrips(req, res) { 
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort('-createdAt'); 
    res.json(trips); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user trips' });
  }
}

async function updateTrip(req, res) {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found or unauthorized' });
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating trip' });
  }
}

async function deleteTrip(req, res) {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or unauthorized' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting trip' });
  }
}

async function getExploreTrips(req, res) {
  try {
    const query = { userId: { $ne: req.user._id }, startDate: { $gte: new Date() } };
    if (req.query.destination) query.destination = { $regex: req.query.destination, $options: 'i' }; 
    const trips = await Trip.find(query)
      .populate('userId', 'name profileImage bio location')
      .sort('startDate'); 
    res.json(trips); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching explore trips' });
  }
}

async function requestJoinTrip(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.equals(req.user._id)) return res.status(400).json({ message: 'Cannot join your own trip' });
    if (trip.members.includes(req.user._id) || trip.joinRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already requested or joined' });
    }

    trip.joinRequests.push(req.user._id);
    await trip.save();

    await Notification.create({
      userId: trip.userId,
      type: 'trip_request',
      title: 'New Trip Request',
      body: `${req.user.name} wants to join your trip to ${trip.destination}`,
      senderId: req.user._id,
      tripId: trip._id
    });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting to join trip' });
  }
}

async function respondJoinTrip(req, res) {
  try {
    const { action, requesterId } = req.body; 
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or unauthorized' });

    trip.joinRequests = trip.joinRequests.filter(id => id.toString() !== requesterId);

    if (action === 'accept') {
      if (!trip.members.includes(requesterId)) {
        trip.members.push(requesterId);
      }
      
      // Add the accepted user to the Trip's Group Chat directly
      const group = await Group.findOne({ tripId: trip._id });
      if (group && !group.members.includes(requesterId)) {
        group.members.push(requesterId);
        await group.save();
      }

      await Notification.create({
        userId: requesterId,
        type: 'trip_accepted',
        title: 'Trip Request Accepted!',
        body: `Your request to join the trip to ${trip.destination} was accepted.`,
        tripId: trip._id
      });
    } else {
      await Notification.create({
        userId: requesterId,
        type: 'trip_rejected',
        title: 'Trip Request Declined',
        body: `Your request to join the trip to ${trip.destination} was declined.`,
        tripId: trip._id
      });
    }

    await trip.save();
    await trip.populate('joinRequests', 'name profileImage bio');
    await trip.populate('members', 'name profileImage bio');
    
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error responding to request' });
  }
}

module.exports = { createTrip, getTrips, getTripById, myTrips, updateTrip, deleteTrip, getExploreTrips, requestJoinTrip, respondJoinTrip };
