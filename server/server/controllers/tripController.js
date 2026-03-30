const { db } = require('../config/firebase');

const placeholders = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
];

// Helper to manually hydrate user data (replacement for .populate)
async function hydrateUserData(userId) {
  if (!userId) return null;
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  const data = userDoc.data();
  return { id: userDoc.id, name: data.name, profileImage: data.profileImage, bio: data.bio, location: data.location };
}

async function createTrip(req, res) { 
  try {
    const imageUrl = placeholders[Math.floor(Math.random() * placeholders.length)] + '?auto=format&fit=crop&w=800&q=80';
    const tripData = { 
      ...req.body, 
      userId: req.user.id, 
      imageUrl,
      members: [req.user.id],
      joinRequests: [],
      createdAt: new Date().toISOString()
    };
    
    const tripRef = await db.collection('trips').add(tripData);
    
    // Automatically spin up a Group Chat for this trip
    await db.collection('groups').add({ 
      groupName: `${req.body.destination} Squad`, 
      tripId: tripRef.id, 
      members: [req.user.id],
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ id: tripRef.id, ...tripData }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating trip' });
  }
}

async function getTrips(req, res) { 
  try {
    let query = db.collection('trips');
    
    // Firestore lacks native regex, so we do exact or skip for now
    // A better approach would be Algolia or client-side filtering, but we keep it simple
    if (req.query.destination) {
      query = query.where('destination', '==', req.query.destination);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const trips = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      const user = await hydrateUserData(data.userId);
      return { id: doc.id, ...data, userId: user };
    }));
    
    res.json(trips); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching trips' });
  }
}

async function getTripById(req, res) { 
  try {
    const tripDoc = await db.collection('trips').doc(req.params.id).get();
    if (!tripDoc.exists) return res.status(404).json({message: 'Trip not found'});  
    
    const data = tripDoc.data();
    const user = await hydrateUserData(data.userId);
    const members = await Promise.all((data.members || []).map(hydrateUserData));
    const joinRequests = await Promise.all((data.joinRequests || []).map(hydrateUserData));

    res.json({ 
      id: tripDoc.id, 
      ...data, 
      userId: user, 
      members: members.filter(Boolean), 
      joinRequests: joinRequests.filter(Boolean) 
    }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching trip details' });
  }
}

async function myTrips(req, res) { 
  try {
    // Firestore requires a composite index for (where userId ==) + (orderBy createdAt).
    // To avoid that setup during development, we fetch by userId and sort in memory.
    const snapshot = await db.collection('trips')
      .where('userId', '==', req.user.id)
      .get();

    const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user trips' });
  }
}

async function updateTrip(req, res) {
  try {
    const tripRef = db.collection('trips').doc(req.params.id);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists || tripDoc.data().userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    
    await tripRef.update(req.body);
    const updated = await tripRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating trip' });
  }
}

async function deleteTrip(req, res) {
  try {
    const tripRef = db.collection('trips').doc(req.params.id);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists || tripDoc.data().userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    
    await tripRef.delete();
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting trip' });
  }
}

async function getExploreTrips(req, res) { 
  try {
    // Relaxed date filter by 1 day to handle timezone edge cases
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const filterDate = date.toISOString().split('T')[0];
    
    console.log(`[Explore] Fetching for user ${req.user.id} since ${filterDate}`);

    const snapshot = await db.collection('trips')
      .where('startDate', '>=', filterDate)
      .get();
    
    console.log(`[Explore] Found ${snapshot.docs.length} total future/current trips in db`);

    let trips = await Promise.all(
      snapshot.docs
        .filter(doc => {
          const isMine = String(doc.data().userId) === String(req.user.id);
          return !isMine;
        })
        .map(async doc => {
          const data = doc.data();
          const user = await hydrateUserData(data.userId);
          return { id: doc.id, ...data, userId: user };
        })
    );

    console.log(`[Explore] Returning ${trips.length} trips to user after filtering 'mine'`);

    trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    res.json(trips); 
  } catch (err) {
    console.error('[Explore] Error:', err);
    res.status(500).json({ message: 'Error fetching explore trips' });
  }
}

async function requestJoinTrip(req, res) {
  try {
    const tripRef = db.collection('trips').doc(req.params.id);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) return res.status(404).json({ message: 'Trip not found' });
    const data = tripDoc.data();
    
    if (data.userId === req.user.id) return res.status(400).json({ message: 'Cannot join your own trip' });
    if (data.members.includes(req.user.id) || data.joinRequests.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already requested or joined' });
    }

    const updatedRequests = [...(data.joinRequests || []), req.user.id];
    await tripRef.update({ joinRequests: updatedRequests });

    const notificationData = {
      userId: data.userId,
      type: 'trip_request',
      title: 'New Trip Request',
      body: `${req.user.name} wants to join your trip to ${data.destination}`,
      senderId: req.user.id,
      tripId: tripDoc.id,
      createdAt: new Date().toISOString(),
      read: false
    };

    const notificationRef = await db.collection('notifications').add(notificationData);
    
    // Emit real-time notification
    const io = req.app.get('socketio');
    if (io) {
      io.to(data.userId).emit('notifications:new', { id: notificationRef.id, ...notificationData });
    }

    res.json({ id: tripDoc.id, ...data, joinRequests: updatedRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting to join trip' });
  }
}

async function respondJoinTrip(req, res) {
  try {
    const { action, requesterId } = req.body; 
    const tripRef = db.collection('trips').doc(req.params.id);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists || tripDoc.data().userId !== req.user.id) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    const data = tripDoc.data();
    let members = data.members || [];
    let joinRequests = (data.joinRequests || []).filter(id => id !== requesterId);

    const io = req.app.get('socketio');

    if (action === 'accept') {
      if (!members.includes(requesterId)) {
        members.push(requesterId);
      }
      
      const groupSnapshot = await db.collection('groups').where('tripId', '==', tripDoc.id).get();
      if (!groupSnapshot.empty) {
        const groupDoc = groupSnapshot.docs[0];
        const groupMembers = groupDoc.data().members || [];
        if (!groupMembers.includes(requesterId)) {
          await groupDoc.ref.update({ members: [...groupMembers, requesterId] });
        }
      }

      const notifData = {
        userId: requesterId,
        type: 'trip_accepted',
        title: 'Trip Request Accepted!',
        body: `Your request to join the trip to ${data.destination} was accepted.`,
        tripId: tripDoc.id,
        createdAt: new Date().toISOString(),
        read: false
      };
      const nRef = await db.collection('notifications').add(notifData);
      if (io) io.to(requesterId).emit('notifications:new', { id: nRef.id, ...notifData });

    } else {
      const notifData = {
        userId: requesterId,
        type: 'trip_rejected',
        title: 'Trip Request Declined',
        body: `Your request to join the trip to ${data.destination} was declined.`,
        tripId: tripDoc.id,
        createdAt: new Date().toISOString(),
        read: false
      };
      const nRef = await db.collection('notifications').add(notifData);
      if (io) io.to(requesterId).emit('notifications:new', { id: nRef.id, ...notifData });
    }

    await tripRef.update({ members, joinRequests });
    
    // Hydrate for response
    const user = await hydrateUserData(data.userId);
    const membersHydrated = await Promise.all(members.map(hydrateUserData));
    const requestsHydrated = await Promise.all(joinRequests.map(hydrateUserData));

    res.json({ 
      id: tripDoc.id, 
      ...data, 
      members: membersHydrated.filter(Boolean), 
      joinRequests: requestsHydrated.filter(Boolean),
      userId: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error responding to request' });
  }
}

module.exports = { createTrip, getTrips, getTripById, myTrips, updateTrip, deleteTrip, getExploreTrips, requestJoinTrip, respondJoinTrip };

