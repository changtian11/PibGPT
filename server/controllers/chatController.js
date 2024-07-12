const ChatMessage = require('../models/chatMessageModel');
const ChatRoom = require('../models/chatRoomModel');
const File = require('../models/fileModel');
const { moveFile, getFileType } = require('../utils/fileUtil');


/**
 * Create a new chatroom from user-end.
 */
const createChatroom = async (req, res) => {
    const { topic } = req.body;
    const roomId = `${Date.now()}-${Math.random().toString().slice(2, 9)}}`
    const chatRoom = new ChatRoom(
        roomId,
        topic,

    )
}

const getChatroomList = async (req, res) => {

}

const getChatroomHistrory = async (req, res) => {

}

const uploadFileToChatroom = async (req, res) => {
    if (req.file) {
        const { originalname, filename } = req.file;
        const fileExtension = path.extname(originalname).toLowerCase().substring(1);
        const fileType = getFileType(fileExtension);
        const file = new File({ filename, fileType });
    }
    else {
        res.json({
            success: true,
            message: 'No file uploaded',
            code: 400
        })
    }
}

module.exports = {
    createChatroom,
    getChatroomList,
    getChatroomHistrory,
    uploadFileToChatroom
}