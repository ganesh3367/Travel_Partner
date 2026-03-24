const Notification = require('../models/Notification');

async function getNotifications(req, res) { 
  try {
    const n = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(50); 
    res.json(n); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
}

async function markRead(req, res) { 
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true }); 
    res.json(n); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark notification read' });
  }
}

async function markAllRead(req, res) { 
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true }); 
    res.json({ success: true }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark all notifications read' });
  }
}

module.exports = { getNotifications, markRead, markAllRead };
