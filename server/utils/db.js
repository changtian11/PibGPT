import mongoose from 'mongoose';
import config from './config.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.get('MONGODB_URI'));
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }
}