import ChatMessage from '../models/chatMessageModel.js';
import ChatRoom from '../models/chatRoomModel.js';
import File from '../models/fileModel.js';
import { moveFile, getFileType } from '../utils/fileUtil.js';
import { ResErrorConstructor } from '../utils/errorHandler.js';


/**
 * Create a new chat room from user-end.
 */
export const createChatRoom = async (req, res) => {
    const { userId } = req.user;
    const roomId = `${Date.now()}-${Math.random().toString().slice(2, 9)}`
    const newChatroom = new ChatRoom(
        {
            roomId,
            topic: '',
            users: [userId]
        })
    try {
        const chatRoom = await newChatroom.save();
        res.json({
            success: true,
            data: {
                roomId: chatRoom.roomId,
                topic: '',
                lastMessageTime: chatRoom.lastMessageTime
            }
        })
    }
    catch (err) {
        console.error(err)
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }

}


export const updateChatRoomTopic = async (chatRoomId, newTopic = "") => {
    try {
        const chatRoom = ChatRoom.findOne({ roomId: chatRoomId });
        if (chatRoom) {
            chatRoom.updateTopic(newTopic);
        }
    }
    catch (err) {
        console.error(err);
    }
}

export const getChatRoomList = async (req, res) => {
    const { userId, role } = req.user;
    try {
        let chatRooms = null
        if (role === 'user') {
            chatRooms = await ChatRoom.find({ users: userId }, 'roomId topic lastMessageTime -_id').sort({ lastMessageTime: -1 }).exec();
        }
        else if (role === 'bot') {
            chatRooms = await ChatRoom.find({}, 'roomId topic lastMessageTime -_id').sort({ lastMessageTime: 1 }).exec();
        }
        else {
            return res.json({
                success: false,
                code: 400,
                message: 'Bad request: Invalid user role'
            })
        }

        return res.json({
            success: true,
            data: chatRooms
        })

    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

export const deleteChatRoomById = async (req, res) => {
    const { userId, role } = req.user;
    const { roomId } = req.params;
    try {
        let chatRoomToDelete = null;
        if (role === 'user') {
            chatRoomToDelete = await ChatRoom.findOne({ roomId, users: userId }).exec();
        }
        else if (role === 'bot') {
            chatRoomToDelete = await ChatRoom.findOne({ roomId }).exec();
        }
        else {
            return res.json({
                success: false,
                code: 400,
                message: 'Bad request: Invalid user role'
            })
        }
        if (chatRoomToDelete) {
            await chatRoomToDelete.deleteOne();
            return res.json({
                success: true
            });
        }
        else {
            return res.json({
                success: false,
                code: 402,
                message: 'No chat room to delete'
            })
        }


    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

export const deleteEmptyChatRooms = async (req, res) => {
    const { userId, role } = req.user;
    try {
        let emptyChatRooms = null
        if (role === 'user') {
            emptyChatRooms = await ChatRoom.find({
                $and: [
                    { users: { $size: 1 } }, // Only rooms with one member (the owner)
                    { users: userId }, // Ensure that the owner's ID is in the members array
                    { messages: { $size: 0 } } // No messages in the room
                ]
            }, '_id').exec();
        }
        else if (role === 'bot') {
            emptyChatRooms = await ChatRoom.find({
                $or: [
                    { users: { $size: 0 } },  // Members array is empty
                    { messages: { $size: 0 } }  // Messages array is empty
                ]
            }, '_id').exec();
        }
        else {
            return res.json({
                success: false,
                code: 400,
                message: 'Bad request: Invalid user role'
            })
        }
        console.log(emptyChatRooms);
        if (!emptyChatRooms || emptyChatRooms.length === 0) {
            return res.json({
                success: true,
                message: 'No empty chat room found'
            })
        }
        else {
            const delPromises = emptyChatRooms.map(room => room.deleteOne());
            await Promise.all(delPromises);
            return res.json({
                success: true,
                message: 'All empty chat rooms have been deleted'
            })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

export const deleteAllChatRooms = async (req, res) => {
    const { userId, role } = req.user;
    try {
        let chatRoomsToDelete = null;
        if (role === 'user') {
            chatRoomsToDelete = await ChatRoom.find({ users: userId }, 'messages _id').exec();
        }
        else if (role === 'bot') {
            chatRoomsToDelete = await ChatRoom.find({}, 'messages _id').exec();
        }
        else {
            return res.json({
                success: false,
                code: 400,
                message: 'Bad request: Invalid user role'
            })
        }
        console.log(chatRoomsToDelete);
        if (!chatRoomsToDelete || chatRoomsToDelete.length === 0) {
            return res.json({
                success: true,
                message: 'No chat room found'
            })
        }
        else {
            const delPromises = chatRoomsToDelete.map(room => room.deleteOne());
            await Promise.all(delPromises);
            return res.json({
                success: true,
                message: 'All chat rooms have been deleted'
            })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResErrorConstructor.InternalServerError);
    }
}

export const getChatRoomMessageHistory = async (req, res) => {
    const roomIdReg = new RegExp(/^\d{13}-\d{7}$/)
    const roomId = req.params.roomId;
    if (roomId && roomIdReg.test(roomId))
        try {
            const chatRoom = await ChatRoom.findOne({ roomId }).populate({
                path: 'messages',
                populate: [
                    {
                        path: 'sender',
                        select: 'role -_id'
                    },
                    {
                        path: 'file',
                        select: '_id'
                    }
                ]
            });

            if (!chatRoom || chatRoom.length === 0) {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    message: 'Chat room not found'
                })
            }

            if (req.user.role === 'user' && !chatRoom.users.includes(req.user.userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                    code: 403
                })
            }

            const sortedMessages = chatRoom.messages.sort((a, b) => a.createdAt - b.createdAt);

            const result = await Promise.all(sortedMessages.map(async message => {
                if (message.type === 'file' && message.file) {
                    return {
                        type: 'file',
                        content: message.file._id,
                        role: message.sender.role,
                        timestamp: message.createdAt
                    };
                }

                else return {
                    type: 'text',
                    content: message.content,
                    role: message.sender.role,
                    timestamp: message.createdAt
                };
            }));

            res.json({
                success: true,
                data: {
                    roomId: chatRoom.roomId,
                    topic: chatRoom.topic,
                    lastMessageTime: chatRoom.lastMessageTime,
                    messages: result
                }
            })
        }
        catch (err) {
            console.error(err);
            res.status(500).json(ResErrorConstructor.InternalServerError);
        }
    else {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
    }
}