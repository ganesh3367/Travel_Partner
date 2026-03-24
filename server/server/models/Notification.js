const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'invite', 'join_request', 'trip_request', 'trip_accepted', 'trip_rejected'], required: true },
    title: String,
    body: String,
    read: { type: Boolean, default: false },

    // Optional relational metadata so the frontend can perform actions.
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
