const File = require('../models/fileModel');
const { moveFile, deleteFile, getFileType } = require('../utils/fileUtil');

const uploadFile = async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const fileExtension = path.extname(originalname).toLowerCase().substring(1);
        const fileType = getFileType(fileExtension);
        const file = new File({ filename, fileType });
        await file.save()
        await moveFile(filename, fileType);
        res.json({
            success: true,
            code: 200,
            message: 'File uploaded'
        })
    }

    catch (error) {
        res.json(
            {
                success: false,
                code: 500,
                message: error
            }
        )
    }
}

const createNewFile = async (filename, forceFileType) => {
    let fileType = null;
    if (forceFileType) {
        fileType = forceFileType
    }
    else {
        fileType = getFileType(filename)
    }
    const newFile = new File({ filename, fileType });
    await moveFile(filename, fileType);
    await newFile.save();
    return newFile;
}

const removeExistingFile = async (fileObj) => {
    await deleteFile(fileObj.filename, fileObj.fileType);
    await File.findByIdAndDelete(fileObj._id, {}, (err, x) => {
        if (err) throw err
    });
}

const getPfpPathById = async (pfpId) => {
    
}


module.exports = {
    uploadFile,
    createNewFile,
    removeExistingFile
}