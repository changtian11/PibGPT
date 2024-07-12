const mongoose = require('mongoose');

const MONGODB_URI = () => `mongodb+srv://pibgpt-admin:${encodeURIComponent(process.env.MONGODB_PWD)}@cluster0.udocai0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI(), {
            dbName: process.env.MONGODB_DBNAME
        });
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }
}

module.exports = { connectDB };