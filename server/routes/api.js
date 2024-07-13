const express = require('express');
const router = express.Router();

const { getPfpById } = require('../controllers/fileController');
const { registerUser, loginUser, getUserProfile, updateUserPfp, authenticateUser } = require('../controllers/userController');

const uploadMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');


// User register and login
router.post('/register', uploadMiddleware, registerUser);
router.post('/login', loginUser);

// Get resources
router.get('/getPfpById/:pfpId', getPfpById);


// Privileged actions 
router.get('/auth', authMiddleware, authenticateUser)
router.post('/updateUserPfp', authMiddleware, updateUserPfp);
router.get('/getUserProfile', authMiddleware, getUserProfile);

module.exports = router;