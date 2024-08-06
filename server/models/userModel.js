import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    nickname: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    profilePhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'File' }
});

export default mongoose.model('User', userSchema);