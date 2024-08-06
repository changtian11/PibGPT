import mongoose from 'mongoose';
import path from 'path';
import { allowedAttachmentTypes, uploadDirPath } from '../utils/fileUtil.js';

const fileTypes = ['profilePhoto', ...allowedAttachmentTypes]

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true, unique: true },
    fileType: {
        type: String,
        enum: fileTypes, required: true
    },
}, {
    methods: {
        getFilePath() { return path.resolve(uploadDirPath, this.fileType, this.filename) },
    }
})


export default mongoose.model('File', fileSchema);