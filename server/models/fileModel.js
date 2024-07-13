const mongoose = require('mongoose');
const path = require('path');
const { allowedAttachmentTypes, uploadDirPath } = require('../utils/fileUtil');

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


module.exports = mongoose.model('File', fileSchema);