const { db, admin } = require('../config/firebase');

async function hydrateUserData(userId) {
  if (!userId) return null;
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  const data = userDoc.data();
  return { id: userDoc.id, name: data.name, profileImage: data.profileImage };
}

async function createGroup(req, res) { 
  try {
    const { name, description, tripId } = req.body; 
    if (tripId) { 
      const tripDoc = await db.collection('trips').doc(tripId).get();
      if (!tripDoc.exists) return res.status(404).json({message: 'Trip not found'}); 
    } 
    const groupData = { 
      groupName: name, // Standardizing naming
      description, 
      tripId: tripId || null, 
      members: [req.user.id], 
      admins: [req.user.id],
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('groups').add(groupData);
    res.status(201).json({ id: docRef.id, ...groupData }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating group' });
  }
}

async function getGroups(req, res) { 
  try {
    const snapshot = await db.collection('groups')
      .where('members', 'array-contains', req.user.id)
      .get();
    
    let groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort manually in memory to avoid needing a composite index
    groups.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    res.json(groups); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching groups' });
  }
}

async function joinGroup(req, res) { 
  try {
    const groupRef = db.collection('groups').doc(req.params.id);
    const groupDoc = await groupRef.get();
    
    if (!groupDoc.exists) return res.status(404).json({message: 'Group not found'}); 
    
    if (!groupDoc.data().members.includes(req.user.id)) { 
      await groupRef.update({
        members: admin.firestore.FieldValue.arrayUnion(req.user.id)
      });
    } 
    
    const updated = await groupRef.get();
    res.json({ id: updated.id, ...updated.data() }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error joining group' });
  }
}

async function getGroupDetails(req, res) { 
  try {
    const groupDoc = await db.collection('groups').doc(req.params.id).get();
    if (!groupDoc.exists) return res.status(404).json({message: 'Group not found'}); 
    
    const data = groupDoc.data();
    const members = await Promise.all((data.members || []).map(hydrateUserData));
    
    // Fetch related trip if exists
    let trip = null;
    if (data.tripId) {
      const tripDoc = await db.collection('trips').doc(data.tripId).get();
      if (tripDoc.exists) trip = { id: tripDoc.id, ...tripDoc.data() };
    }

    res.json({ 
      id: groupDoc.id, 
      ...data, 
      members: members.filter(Boolean), 
      joinRequests: await Promise.all((data.joinRequests || []).map(hydrateUserData)),
      trip 
    }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching group details' });
  }
}

async function requestJoinGroup(req, res) {
  try {
    const groupRef = db.collection('groups').doc(req.params.id);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) return res.status(404).json({ message: 'Group not found' });
    
    const data = groupDoc.data();
    if (data.members.includes(req.user.id) || (data.joinRequests || []).includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member or request pending' });
    }

    await groupRef.update({
      joinRequests: admin.firestore.FieldValue.arrayUnion(req.user.id)
    });

    // Notify admins
    if (data.admins && data.admins.length > 0) {
      const batch = db.batch();
      data.admins.forEach(adminId => {
        const nRef = db.collection('notifications').doc();
        batch.set(nRef, {
          userId: adminId,
          type: 'group_request',
          title: 'New Group Join Request',
          body: `${req.user.name} wants to join ${data.groupName}`,
          senderId: req.user.id,
          groupId: groupRef.id,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    res.json({ message: 'Request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting to join group' });
  }
}

async function respondJoinGroup(req, res) {
  try {
    const { requesterId, action } = req.body; // 'accept' or 'reject'
    const groupRef = db.collection('groups').doc(req.params.id);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) return res.status(404).json({ message: 'Group not found' });
    
    const data = groupDoc.data();
    if (!data.admins.includes(req.user.id)) return res.status(403).json({ message: 'Unauthorized' });

    if (action === 'accept') {
      await groupRef.update({
        members: admin.firestore.FieldValue.arrayUnion(requesterId),
        joinRequests: admin.firestore.FieldValue.arrayRemove(requesterId)
      });
      
      await db.collection('notifications').add({
        userId: requesterId,
        type: 'group_accepted',
        title: 'Group Request Accepted!',
        body: `You are now a member of ${data.groupName}`,
        groupId: groupRef.id,
        createdAt: new Date().toISOString()
      });
    } else {
      await groupRef.update({
        joinRequests: admin.firestore.FieldValue.arrayRemove(requesterId)
      });
      
      await db.collection('notifications').add({
        userId: requesterId,
        type: 'group_rejected',
        title: 'Group Request Declined',
        body: `Your request to join ${data.groupName} was declined.`,
        groupId: groupRef.id,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ message: `Request ${action}ed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error responding to group request' });
  }
}

module.exports = { createGroup, getGroups, joinGroup, getGroupDetails, requestJoinGroup, respondJoinGroup };

