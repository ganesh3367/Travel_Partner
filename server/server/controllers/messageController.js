const Message = require('../models/Message');

async function getMessages(req, res) { 
  try {
    const { userId } = req.params; 
    const messages = await Message.find({ 
      $or: [ { senderId: req.user._id, receiverId: userId }, { senderId: userId, receiverId: req.user._id } ] 
    }).sort('timestamp'); 
    res.json(messages); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}

async function markRead(req, res) { 
  try {
    await Message.updateMany({ senderId: req.params.userId, receiverId: req.user._id, isRead: false }, { isRead: true }); 
    res.json({ success: true }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to mark read' });
  }
}

async function getGroupMessages(req, res) {
  try {
    const messages = await Message.find({ groupId: req.params.groupId }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
}

module.exports = { getMessages, markRead, getGroupMessages };
