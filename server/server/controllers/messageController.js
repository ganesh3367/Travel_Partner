const { db } = require('../config/firebase');

async function getMessages(req, res) { 
  try {
    const { userId } = req.params; 
    
    // Firestore lacks complex OR. We fetch both directions and merge.
    const q1 = db.collection('messages')
      .where('senderId', '==', req.user.id)
      .where('receiverId', '==', userId)
      .get();
      
    const q2 = db.collection('messages')
      .where('senderId', '==', userId)
      .where('receiverId', '==', req.user.id)
      .get();

    const [s1, s2] = await Promise.all([q1, q2]);
    
    const messages = [...s1.docs, ...s2.docs]
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(messages); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}

async function markRead(req, res) { 
  try {
    const snapshot = await db.collection('messages')
      .where('senderId', '==', req.params.userId)
      .where('receiverId', '==', req.user.id)
      .where('isRead', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    res.json({ success: true }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark read' });
  }
}

async function getGroupMessages(req, res) {
  try {
    const snapshot = await db.collection('messages')
      .where('groupId', '==', req.params.groupId)
      .orderBy('timestamp', 'asc')
      .get();
      
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
}

module.exports = { getMessages, markRead, getGroupMessages };

