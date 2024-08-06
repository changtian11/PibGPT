const mongoose = require('mongoose');
const config = require('./config');
const MONGODB_URI = config.get('MONGODB_URI')


const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DBNAME
        });
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }
}

module.exports = { connectDB };