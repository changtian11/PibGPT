const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    type: { type: String, enum: ['text', 'file'], required: true },
    content: { type: String }, // text
    timestamp: { type: Date, default: Date.now },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: false }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);