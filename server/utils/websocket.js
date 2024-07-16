const WebSocket = require('ws');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/userModel');
const ChatMessage = require('../models/chatMessageModel');
const ChatRoom = require('../models/chatRoomModel');
const BlacklistedToken = require('../models/blacklistedTokenModel');

const authenticate = async (token) => {
    try {
        const blacklistedToken = await BlacklistedToken.findOne({ token });
        if (blacklistedToken) {
            throw new Error('Blacklisted token');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('User not found')
        }
        return user;
    }
    catch (error) {
        console.error(`Authentication failed: ${error.message}`);
        throw error;
    }
}

const authorizeUser = async (user, roomId) => {
    const chatRoom = await ChatRoom.findOne({ roomId }).populate('users');
    if (!chatRoom) {
        throw new Error('Chat room not found');
    }

    if (user.role === 'bot') {
        return chatRoom;
    }

    const isUserInRoom = chatRoom.users.some((roomUser) => roomUser._id.equals(user._id));
    if (!isUserInRoom) {
        throw new Error('User does not have access to this chat room');
    }

    return chatRoom;
};


function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', async (ws, req) => {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;
        if (!token) {
            ws.close(1008, 'Token not found');
            return;
        }

        try {
            const user = await authenticate(token);
            console.info(`User [${user.username}] connected.`)
            ws.user = user;
            ws.send(JSON.stringify({
                event: 'connection',
                success: true
            }))
        }
        catch (err) {
            ws.close(1008, 'User not found');
            return;
        }


        ws.on('message', async (data, isBinary) => {
            const message = isBinary ? data : data.toString();
            try {
                const parsedMessage = JSON.parse(message)
                const { event, payload } = parsedMessage;
                switch (event) {
                    case 'join':
                        const { roomId } = payload;
                        try {
                            if (!roomId) {
                                throw new Error('Room ID invalid')
                            }
                            const chatRoom = await authorizeUser(ws.user, roomId);
                            ws.chatRoom = chatRoom;
                            ws.send(JSON.stringify({
                                success: true,
                                event: 'join',
                                payload: roomId
                            }));
                            console.info(`User [${ws.user.username}] joined the chat room.`)
                        } catch (error) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'join',
                                payload: error.message
                            }));
                        }
                        break;
                    case 'message':
                        console.log(parsedMessage);
                        if (!ws.chatRoom) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'message',
                                payload: 'Chat room not found'
                            }));
                            return;
                        }
                        try {
                            const { content, type } = payload;
                            const chatMessage = new ChatMessage({
                                type,
                                content,
                                sender: ws.user._id,
                                role: ws.user.role
                            });

                            await chatMessage.save();

                            ws.chatRoom.addMessage(chatMessage._id);
                            await ws.chatRoom.save();

                            // Broadcast the message to all clients in the same chat room
                            wss.clients.forEach((client) => {
                                if (client.readyState === WebSocket.OPEN && client.chatRoom && client.chatRoom.roomId === ws.chatRoom.roomId) {
                                    client.send(JSON.stringify({
                                        success: true,
                                        event: 'message',
                                        payload: {
                                            type,
                                            content,
                                            role: ws.user.role,
                                            timestamp: chatMessage.createdAt
                                        }
                                    }));
                                }
                            });
                        }
                        catch (error) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'message',
                                payload: error.message
                            }));
                        }
                        break;
                    case 'leave':
                        ws.chatRoom = null;
                        ws.send(JSON.stringify({
                            success: true,
                            event: 'leave'
                        }));
                        break;
                    default:
                        ws.send(JSON.stringify({
                            success: false,
                            event: 'leave',
                            payload: 'Illegal request'
                        }));
                        break;
                }
            }
            catch (err) {
                console.error(err);
                ws.send(JSON.stringify({ success: false, error: err.message }));
                // ws.close(1003, 'Chat room not found');
            }
        });

        ws.on('close', () => {
            ws.chatRoom = null;
            ws.close(1001, 'Ws closed')
        });
    });
}

module.exports = { setupWebSocket };