import mongoose from "mongoose";

const BlacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiryDate: { type: Date, required: true },
})
export default mongoose.model('BlacklistedToken', BlacklistedTokenSchema);