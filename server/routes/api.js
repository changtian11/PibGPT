const express = require('express');
const router = express.Router();

const fileCtl = require('../controllers/fileController');
const userCtl = require('../controllers/userController');
const chatCtl = require('../controllers/chatController');

const uploadMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');


// User register and login
router.post('/register', uploadMiddleware, userCtl.registerUser);
router.post('/login', userCtl.loginUser);

// Privileged actions 
router.get('/auth', authMiddleware, userCtl.authenticateUser)
router.post('/profile/pfp', authMiddleware, uploadMiddleware, userCtl.updateUserPfp);
router.get('/logout', authMiddleware, userCtl.logoutUser)

// Chat-related
router.get('/chatroom/create', authMiddleware, chatCtl.createChatRoom);
router.post('/chatroom/upload', authMiddleware, uploadMiddleware, fileCtl.uploadFileToChat);
router.get('/chatroom/list', authMiddleware, chatCtl.getChatRoomList);
router.get('/chatroom/h/:roomId?', authMiddleware, chatCtl.getChatRoomMessageHistory);
router.delete('/chatroom/del/:roomId', authMiddleware, chatCtl.deleteChatRoomById);
router.delete('/chatroom/empty', authMiddleware, chatCtl.deleteEmptyChatRooms);
router.delete('/chatroom/all', authMiddleware, chatCtl.deleteAllChatRooms);

// File
router.get('/allowed-file-ext', fileCtl.getAllowedExts);


module.exports = router;