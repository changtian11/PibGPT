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

const getPfpById = async (req, res) => {
    const { pfpId } = req.params;
    if (pfpId) {
        try {
            const pfpFile = await File.findById(pfpId);
            console.log(pfpFile);
            if (pfpFile) {
                console.log(pfpFile.getFilePath());
                return res.sendFile(pfpFile.getFilePath());
            }
            else {
                return res.status(404);
            }
        }
        catch (err) {
            console.error(err);
            return res.status(500);
        }
    }
    else {
        return res.status(400)
    }

}


module.exports = {
    uploadFile,
    createNewFile,
    removeExistingFile,
    getPfpById
}