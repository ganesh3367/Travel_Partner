const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Group = require('../models/Group');

const onlineUsers = new Map(); // userId -> Set<socketId>

function socketHandler(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    
    // Join a room specific to this user so we can emit to all their active tabs/devices!
    socket.join(userId);

    // Track presence using Sets to handle multiple connections per user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    const publishPresence = () => {
      const ids = Array.from(onlineUsers.keys());
      io.emit('presence:update', ids);
    };
    
    publishPresence();

    socket.on('chat:send', async ({ receiverId, message }) => {
      if (!receiverId || !message) return;

      const saved = await Message.create({
        senderId: userId,
        receiverId,
        message,
        timestamp: new Date(),
      });

      const notification = await Notification.create({
        userId: receiverId,
        type: 'message',
        title: 'New message',
        body: message,
        senderId: userId,
      });

      // Emit to all tabs/devices of the receiver
      io.to(receiverId).emit('chat:message', saved);
      io.to(receiverId).emit('notifications:new', notification);

      // Emit back to all tabs/devices of the sender to keep chats synced
      io.to(userId).emit('chat:message', saved);
    });

    socket.on('typing:start', ({ receiverId }) => {
      if (!receiverId) return;
      io.to(receiverId).emit('typing:start', { senderId: userId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      if (!receiverId) return;
      io.to(receiverId).emit('typing:stop', { senderId: userId });
    });

    socket.on('group:join', async (groupId) => {
      if (!groupId) return;
      socket.join(groupId);
    });

    socket.on('group:send', async ({ groupId, message }) => {
      if (!groupId || !message) return;

      const group = await Group.findById(groupId).select('members');
      if (!group) return;

      if (!group.members.some((m) => String(m) === String(userId))) return;

      const saved = await Message.create({
        senderId: userId,
        groupId,
        message,
        timestamp: new Date(),
      });

      await Group.findByIdAndUpdate(groupId, { $addToSet: { messages: saved._id } });

      const otherMembers = group.members.filter((m) => String(m) !== String(userId));
      if (otherMembers.length > 0) {
        const notifications = await Notification.insertMany(
          otherMembers.map((memberId) => ({
            userId: memberId,
            type: 'message',
            title: `New message in group`,
            body: message,
            groupId,
            senderId: userId,
          }))
        );

        for (const n of notifications) {
          io.to(String(n.userId)).emit('notifications:new', n);
        }
      }

      io.to(groupId).emit('group:message', saved);
    });

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          publishPresence();
        }
      }
    });
  });
}

module.exports = { socketHandler };
