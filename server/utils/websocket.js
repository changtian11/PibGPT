const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { User, ChatRoom } = require('./db');
const chatUploadDir = path.join(__dirname, '../../uploads/chat_photos');
const JWT_SECRET = process.env.JWT_SECRET;

if (!fs.existsSync(chatUploadDir)) {
    fs.mkdirSync(chatUploadDir, { recursive: true });
}

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server, path: '/ws' });

    wss.on('connection', async (ws, req) => {
        const token = req.headers.cookie && req.headers.cookie.replace('token=', '');
        if (!token) {
            ws.close();
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) {
                ws.close();
                return;
            }

            ws.on('message', async (message) => {
                const parsedMessage = JSON.parse(message);
                const { roomId, content, type } = parsedMessage;
                const chatMessage = {
                    id: Date.now(),
                    type,
                    content,
                    sender: user._id,
                };

                let chatRoom = await ChatRoom.findOne({ roomId });
                if (!chatRoom) {
                    chatRoom = new ChatRoom({ roomId, topic: 'General', users: [user._id], messages: [] });
                }
                chatRoom.messages.push(chatMessage);
                chatRoom.lastMessageTimestamp = new Date();
                await chatRoom.save();

                // Broadcast the message to all clients in the same chat room
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(chatMessage));
                    }
                });
            });

            // Initialize chat room state
            ws.on('open', async () => {
                const roomId = getRoomIdFromRequest(req); // Function to get roomId from the request
                const chatRoom = await ChatRoom.findOne({ roomId }).populate('messages.sender');
                if (chatRoom) {
                    ws.send(JSON.stringify(chatRoom));
                }
            });
        } catch (err) {
            ws.close();
        }
    });
}

module.exports = setupWebSocket;

function getRoomIdFromRequest(req) {
    // Logic to extract roomId from the request, e.g., from URL query params
    return new URL(req.url, `http://${req.headers.host}`).searchParams.get('roomId');
}