const File = require('../models/fileModel');
const { moveFile, deleteFile, getFileType, getAllowedFileExts } = require('../utils/fileUtil');
const { ResErrorConstructor } = require('../utils/errorHandler');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            })
        }
        const { originalname, filename } = req.file;
        const fileType = getFileType(originalname);
        const newFile = new File({ filename, fileType });
        await moveFile(filename, fileType);
        await newFile.save()
        return res.json({
            success: true,
            code: 200,
            data: {
                fileId: newFile._id
            }
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

const uploadFileToChat = async (req, res) => {
    const { userId, role } = req.user;
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
            code: 401
        });
    }

    const chatRoom = await ChatRoom.findOne({ roomId }).populate('users');

    if (!chatRoom) {
        return res.status(402).json({
            success: false,
            message: 'Targeted chat room does not exist',
            code: 402
        })
    }

    else if (role === 'user') {
        const isUserInRoom = chatRoom.users.some((roomUser) => roomUser._id.equals(user._id));
        if (!isUserInRoom) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                code: 401
            })
        }
    }

    const newFile = new File({
        filename: file.filename,
        fileType,
    });
    await newFile.save();

    const newChatMessage = new ChatMessage({
        type: 'file',
        sender: userId,
        file: newFile._id,
    });
    await newChatMessage.save();

    chatRoom.addMessage(newChatMessage._id);
    await chatRoom.save();

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.chatRoom && client.chatRoom.roomId === roomId) {
            client.send(JSON.stringify(newChatMessage));
        }
    });

    return res.json({
        success: true,
        code: 200
    })
}

const createAndMoveFile = async (filename, forceFileType) => {
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

const getPfpByFileId = async (req, res) => {
    const { pfpId } = req.params;
    if (!pfpId || pfpId === 'undefined' || pfpId === 'null') {
        return res.status(400).json({
            success: false,
            message: 'Invalid profile photo id'
        })
    }

    try {
        const pfpFile = await File.findById(pfpId);
        if (pfpFile) {
            return res.sendFile(pfpFile.getFilePath());
        }
        else {
            return res.status(404);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

const getFileByFileId = async (req, res) => {
    const { fileId } = req.params;
    if (!fileId || fileId === 'undefined' || fileId === 'null') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file id'
        })
    }
    try {
        const file = await File.findById(fileId);
        if (file) {
            return res.sendFile(file.getFilePath());
        }
        else {
            return res.status(404);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

const getAllowedExts = async (req, res) => {
    return res.json({
        success: true,
        content: getAllowedFileExts()
    })
}

module.exports = {
    uploadFile,
    uploadFileToChat,
    createAndMoveFile,
    removeExistingFile,
    getPfpByFileId,
    getFileByFileId,
    getAllowedExts
}