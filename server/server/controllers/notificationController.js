const { db } = require('../config/firebase');

async function getNotifications(req, res) { 
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
      
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(notifications); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
}

async function markRead(req, res) { 
  try {
    const notificationRef = db.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data().userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }
    
    await notificationRef.update({ isRead: true });
    res.json({ id: notificationDoc.id, ...notificationDoc.data(), isRead: true }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark notification read' });
  }
}

async function markAllRead(req, res) { 
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.id)
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
    res.status(500).json({ message: 'Failed to mark all notifications read' });
  }
}

module.exports = { getNotifications, markRead, markAllRead };

