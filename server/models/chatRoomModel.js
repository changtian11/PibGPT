import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'
    }],
    lastMessageTime: { type: Date, default: () => Date.now() },
    topic: { type: String },
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

chatRoomSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        let chatRoom = this;
        await chatRoom.model('ChatMessage').deleteMany({ _id: { $in: chatRoom.messages } });
        next()
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('ChatRoom', chatRoomSchema);