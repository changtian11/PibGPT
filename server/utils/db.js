const mongoose = require('mongoose');
const config = require('./config');
const MONGODB_PWD = config.get('MONGODB_PWD');
const MONGODB_DBNAME = config.get('MONGODB_DBNAME');

const MONGODB_URI = () => `mongodb+srv://pibgpt-admin:${encodeURIComponent(MONGODB_PWD)}@cluster0.udocai0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI(), {
            dbName: MONGODB_DBNAME
        });
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }
}

module.exports = { connectDB };