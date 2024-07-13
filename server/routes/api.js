const express = require('express');
const router = express.Router();

const fileCtl = require('../controllers/fileController');
const userCtl = require('../controllers/userController');
const chatCtl = require('../controllers/chatController');

const uploadMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');


// User register and login
router.post('/register', uploadMiddleware, userCtl.registerUser);
router.post('/login', userCtl.loginUser);

// Get resources
router.get('/getPfpById/:pfpId', fileCtl.getPfpById);


// Privileged actions 
router.get('/auth', authMiddleware, userCtl.authenticateUser)
router.post('/update-pfp', authMiddleware, userCtl.updateUserPfp);
router.get('/getUserProfile', authMiddleware, userCtl.getUserProfile);
router.get('/logout', authMiddleware, userCtl.logoutUser)

// Chat-related

router.get('/createChatroom', authMiddleware, chatCtl.createChatRoom)
router.get('/chat/:chatId', authMiddleware, chatCtl.getChatRoomMessageHistory)
router.get('/chatrooms', authMiddleware, chatCtl.getUserChatRoomList);
router.get('/all-chatrooms', authMiddleware, adminAuthMiddleware, chatCtl.getAllChatRoomList);

module.exports = router;