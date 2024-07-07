const mongoose = require('mongoose');

const MONGODB_URI = ''

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://pibgpt-admin:${encodeURIComponent(process.env.MONGODB_PWD)}@cluster0.udocai0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
            dbName: process.env.MONGODB_DBNAME
        });
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }
}

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    nickname: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    profilePhoto: { type: String }
});


// ChatMessage Schema
const chatMessageSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // Unique identifier, timestamp
    type: { type: String, enum: ['text', 'image'], required: true },
    content: { type: String, required: true }, // Unified content property for both text and image URL
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
}, { _id: false });

// ChatRoom Schema
const chatRoomSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of users in the chat room
    messages: [chatMessageSchema], // Array of chat messages
    lastMessageTimestamp: { type: Date, default: Date.now }, // Timestamp of the last message
    topic: { type: String, required: true }, // Topic of the chat room
    roomId: { type: String, required: true, unique: true } // Unique ID for the chat room
});

// Blacklisted Token Schema
const BlacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiryDate: { type: Date, required: true },
});

// Models
const User = mongoose.model('User', userSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);


module.exports = { connectDB, User, ChatRoom, ChatMessage, BlacklistedToken };