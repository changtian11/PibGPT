const WebSocket = require('ws');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const JWT_SECRET = config.get("JWT_SECRET");
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
        const user = await User.findById(decoded.userId, 'nickname username profilePhoto role _id');
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
            ws.send(JSON.stringify({
                event: 'connection',
                success: false,
                payload: `${err.message}`
            }))
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
                            if (!roomId || roomId === 'undefined') {
                                throw new Error('Room ID invalid')
                            }
                            const chatRoom = await authorizeUser(ws.user, roomId);
                            ws.chatRoom = chatRoom;
                            ws.send(JSON.stringify({
                                success: true,
                                event: 'join',
                                payload: roomId
                            }));
                            console.info(`[${ws.user.role}]${ws.user.username} joined the chat room [${roomId}].`)
                            // Notify all online bots.
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN && client.user.role === 'bot') {
                                    client.send(JSON.stringify({
                                        success: true,
                                        event: 'user-joined',
                                        payload: {
                                            roomId: roomId,
                                            user: {
                                                nickname: ws.user.nickname,
                                                username: ws.user.username,
                                                pfpId: ws.user.profilePhoto,
                                                role: ws.user.role
                                            }
                                        }
                                    }))
                                }
                            })
                            break;
                        } catch (error) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'join',
                                payload: error.message
                            }));
                            break;
                        }
                    case 'message':
                        if (!ws.chatRoom) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'message',
                                payload: 'Chat room not joined'
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
                            wss.clients.forEach(client => {
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
                            break;
                        }
                        catch (error) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'message',
                                payload: error.message
                            }));
                            break;
                        }
                    case 'leave':
                        if (!!ws.chatRoom) {
                            console.info(`[${ws.user.role}]${ws.user.username} left the chat room [${ws.chatRoom.roomId}].`)
                            // Notify all online bots.
                            wss.clients.forEach(client => {
                                if (client !== ws && client.readyState === WebSocket.OPEN && client.user.role === 'bot') {
                                    client.send(JSON.stringify({
                                        success: true,
                                        event: 'user-left',
                                        payload: {
                                            roomId: ws.chatRoom.roomId,
                                            user: ws.user
                                        }
                                    }))
                                }
                            })
                        }
                        ws.chatRoom = null;
                        ws.send(JSON.stringify({
                            success: true,
                            event: 'leave'
                        }));
                        break;
                    case 'room-list':
                        const onlineChatRoomList = [];
                        wss.clients.forEach(client => {
                            if (client.chatRoom && client.user.role === 'user') {
                                onlineChatRoomList.push({
                                    roomId: client.chatRoom.roomId,
                                    user: {
                                        nickname: client.user.nickname,
                                        username: client.user.username,
                                        pfpId: client.user.profilePhoto,
                                        role: client.user.role
                                    }
                                })
                            }
                        })
                        ws.send(JSON.stringify({
                            success: true,
                            event: 'room-list',
                            payload: onlineChatRoomList
                        }))
                        break;
                    case 'update-topic':
                        if (ws.user.role !== 'bot') {
                            break;
                        }
                        if (!ws.chatRoom) {
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'update-topic',
                                payload: 'Chat room not joined'
                            }));
                            break;
                        }
                        try {
                            const { title } = payload;
                            ws.chatRoom.updateTopic(title);
                            await ws.chatRoom.save();
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        event: 'update-topic',
                                        success: true,
                                        payload: { title }
                                    }))
                                }
                            })
                        }
                        catch (err) {
                            console.error(err);
                            ws.send(JSON.stringify({
                                success: false,
                                event: 'modify-title',
                                payload: err.message
                            }))
                        }
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
            if (!!ws.chatRoom) {
                console.info(`User [${ws.user.username}] left the chat room [${ws.chatRoom.roomId}].`)
                // Notify all online bots.
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN && client.user.role === 'bot') {
                        client.send(JSON.stringify({
                            success: true,
                            event: 'user-left',
                            payload: {
                                roomId: ws.chatRoom.roomId,
                                user: ws.user
                            }
                        }))
                    }
                });
                ws.chatRoom = null;
            }
            ws.close(1001, 'Ws closed')
        });
    });
}

module.exports = { setupWebSocket };