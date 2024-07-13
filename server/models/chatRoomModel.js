const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'
    }],
    lastMessageTime: { type: Date, default: () => Date.now() },
    topic: { type: String, required: true },
}, {
    methods: {
        addUser(userId) {
            this.users.push(userId);
        },
        addMessage(messageId) {
            this.messages.push(messageId)
            this.lastMessageTime = new Date();
        },
        updateTopic(newTopic) {
            this.topic = newTopic;
        }
    }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);