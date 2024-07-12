const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getUserProfile, getUserPfp, updateUserPfp, authenticateUser } = require('../controllers/userController');

const uploadMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');


// Regsiter and login
router.post('/regsiter', uploadMiddleware, registerUser);
router.post('/login', loginUser);

// Privileged actions 
router.get('/auth', authMiddleware, authenticateUser)
router.post('/updateUserPfp', authMiddleware, updateUserPfp);
router.get('/getUserProfile', authMiddleware, getUserProfile);
router.get('/getUserPfp', authMiddleware, getUserPfp);

module.exports = router;