const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, ChatRoom, BlacklistedToken } = require('../utils/db');
const pfpUploadDir = path.join(__dirname, '../../uploads/profile_photos');


if (!fs.existsSync(pfpUploadDir)) {
    fs.mkdirSync(pfpUploadDir, { recursive: true });
}

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;

// Image uploads for profile photos
const pfpStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pfpUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Image uploads for chat photos
const chatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, chatUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadPfp = multer({ storage: pfpStorage });
const uploadChat = multer({ storage: chatStorage });

// Register a new user
app.post('/api/register', uploadPfp.single('profilePhoto'), async (req, res) => {
    const { username, password, role } = req.body;

    if (role === 'user' && !req.file) {
        return res.json({
            success: false,
            message: 'No profile photo uploaded',
            code: 401
        })
    }

    const deleteUploadedPfp = (fileName) => {
        if (fileName) {
            fs.unlink(path.join(pfpUploadDir, fileName), err => {
                if (err) {
                    console.error(`Failed to delete profile photo ${fileName}: ${err.message}`);
                }
                else {
                    console.log(`File "${fileName}" has been deleted.`)
                }
            })
        }
    }

    const pfpFilename = req.file ? req.file.filename : '';

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            deleteUploadedPfp(pfpFilename);
            return res.json({
                code: 400,
                success: false,
                message: 'User already exists'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role, profilePhoto: pfpFilename });
        await user.save();
        return res.json({
            success: true,
            message: "User registered"
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: `Failed to register user: ${error.messages}`,
            code: 500
        })
        deleteUploadedPfp(pfpFilename);
        console.error(error);
    }

});

// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(200).send({
            success: false,
            code: 401,
            message: "Invalid username or password"
        });
    }
    // Generate a token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: '14d'
    });
    res.cookie('token', token, { httpOnly: true });
    if (user.role === 'bot') {
        res.redirect('/pit-admin');
    } else {
        res.send({
            success: true,
            message: 'Login succeed'
        });
    }
});

// Middleware to authenticate JWT, and check if token is blacklisted, and get user from token
const authenticate = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(200).json({
            success: false,
            code: 401,
            message: 'Not authenticated'
        });
    }

    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
        return res.json({
            success: false,
            code: 401,
            message: 'Token is blacklisted'
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        next();
    }
    catch (error) {
        console.error(error);
        return res.json({
            success: false,
            code: 401,
            message: 'Invalid token'
        });
    }
};

// Validate the login and return user data
app.get('/api/validate-login', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: {
            nickname: req.user.nickname,
            username: req.user.username,
            profilePhoto: req.user.profilePhoto
        }
    })
})

app.get('/api/logout', authenticate, async (req, res) => {
    try {
        const token = req.cookies.token
        const blacklistedToken = new BlacklistedToken({ token, expiryDate: new Date((jwt.decode(token).iat + 14 * 24 * 3600) * 1000) });
        await blacklistedToken.save();
        res.json({
            success: true,
            message: 'Logged out'
        })
    }
    catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: 'Logout failed',
            code: 500
        })
    }
})

// Get profile photo by filename
app.get('/api/pfp/:pfpId', authenticate, async (req, res) => {
    const { pfpId } = req.params
    res.sendFile(path.join(pfpUploadDir, pfpId));
})


// Create a new chat room
app.post('/api/chatroom', authenticate, async (req, res) => {
    const { topic } = req.body;
    const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const chatRoom = new ChatRoom({ roomId, topic, users: [req.user._id], messages: [] });
    await chatRoom.save();
    res.send({ roomId, topic });
});

// Get chat history for a specific chat room
app.get('/api/chatroom/:roomId', authenticate, async (req, res) => {
    const { roomId } = req.params;
    const chatRoom = await ChatRoom.findOne({ roomId }).populate('messages.sender');
    if (!chatRoom) {
        return res.status(404).send({ error: 'Chat room not found' });
    }
    res.send(chatRoom);
});

app.post('/api/chatroom-image', authenticate, uploadChat.single('image'), async (req, res) => {

})

app.post('/api/update-pfp', authenticate, uploadPfp.single('profilePhoto'), async (req, res) => {
    if (!req.file) {
        return res.json({
            success: false,
            code: 400,
            message: "No file uploaded",
        })
    }
    const userId = req.user._id;
    const pfpFilename = req.file.filename;

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.profilePhoto) {
            fs.unlink(path.join(pfpUploadDir, user.profilePhoto), err => {
                console.err(`Failed to delete old profile photo ${pfpFilename}: ${err.message}`);
            })
        }
        user.profilePhoto = pfpFilename;
        await user.save();
        res.json({
            success: true,
            message: 'Profile photo has updated'
        })
    }
    catch (error) {
        if (pfpFilename) {
            fs.unlink(path.join(pfpUploadDir, pfpFilename), err => {
                console.err(`Failed to delete newly uploaded profile photo ${pfpFilename}: ${err.message}`);
            })
        };
        res.json({
            success: false,
            message: error.message,
            code: 500
        })
    }
})

// Image upload route
// app.post('/api/upload', authenticate, upload.single('image'), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).send({ status: 'No file uploaded' });
//     }
//     const imageUrl = `/uploads/${req.file.filename}`;
//     const imageMessage = {
//         id: Date.now(),
//         type: 'image',
//         content: imageUrl,
//         sender: req.user._id
//     };

//     const { roomId } = req.body;
//     let chatRoom = await ChatRoom.findOne({ roomId });
//     if (!chatRoom) {
//         return res.status(404).send({ error: 'Chat room not found' });
//     }
//     chatRoom.messages.push(imageMessage);
//     chatRoom.lastMessageTimestamp = new Date();
//     await chatRoom.save();

//     res.send({ status: 'Image uploaded', url: imageUrl });
// });

module.exports = app;
