const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users in the chat room
    messages: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'
    }], // Array of chat messages
    lastMessageTimestamp: { type: Date, default: Date.now }, // Timestamp of the last message
    topic: { type: String, required: true }, // Topic of the chat room
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);