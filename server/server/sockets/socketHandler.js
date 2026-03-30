const jwt = require('jsonwebtoken');
const { db, admin } = require('../config/firebase');

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
    if (!db) {
      console.error('Socket connected but Firebase not initialized');
      return;
    }
    
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

      const messageData = {
        senderId: userId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      const messageRef = await db.collection('messages').add(messageData);
      const saved = { id: messageRef.id, ...messageData };

      const notificationData = {
        userId: receiverId,
        type: 'message',
        title: 'New message',
        body: message,
        senderId: userId,
        createdAt: new Date().toISOString()
      };

      const notificationRef = await db.collection('notifications').add(notificationData);
      const notification = { id: notificationRef.id, ...notificationData };

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

      const groupRef = db.collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
      if (!groupDoc.exists) return;

      const groupData = groupDoc.data();
      if (!groupData.members.includes(userId)) return;

      const messageData = {
        senderId: userId,
        groupId,
        message,
        timestamp: new Date().toISOString(),
      };

      const messageRef = await db.collection('messages').add(messageData);
      const saved = { id: messageRef.id, ...messageData };

      const otherMembers = groupData.members.filter((m) => m !== userId);
      if (otherMembers.length > 0) {
        const batch = db.batch();
        const notificationPromises = otherMembers.map(async (memberId) => {
          const nRef = db.collection('notifications').doc();
          const nData = {
            userId: memberId,
            type: 'message',
            title: `New message in group`,
            body: message,
            groupId,
            senderId: userId,
            createdAt: new Date().toISOString()
          };
          batch.set(nRef, nData);
          return { id: nRef.id, ...nData };
        });

        const notifications = await Promise.all(notificationPromises);
        await batch.commit();

        notifications.forEach((n) => {
          io.to(n.userId).emit('notifications:new', n);
        });
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

