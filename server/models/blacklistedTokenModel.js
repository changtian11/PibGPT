const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiryDate: { type: Date, required: true },
})

module.exports = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);