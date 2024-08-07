const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger')('db');

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000;

function connectDB(attempt = 1) {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(config.get('MONGODB_URI'));
            logger.info('Connected to MongoDB.')
            resolve();
        }
        catch (err) {
            logger.error(`MongoDB connection failed: ${err}`);
            if (attempt < MAX_RETRY_ATTEMPTS) {
                logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${attempt + 1})`);
                setTimeout(() => connectDB(attempt + 1).then(resolve).catch(reject), RETRY_DELAY);
            } else {
                reject(new Error('Failed to connect to MongoDB Max retry attempts reached'));
            }
        }
    })
}

module.exports = { connectDB };