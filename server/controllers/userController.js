const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const JWT_SECRET = config.get("JWT_SECRET");
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const BlacklistedToken = require('../models/blacklistedTokenModel');
const { createAndMoveFile } = require('../controllers/fileController');

const registerUser = async (req, res) => {
    const { username, password, role, filePurpose, nickname } = req.body;
    try {

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({
                code: 400,
                success: false,
                message: 'User already exists'
            })
        }

        if (role === 'user' && !req.file) {
            return res.json({
                success: false,
                message: 'Profile photo is required',
                code: 401
            })
        }

        if (!filePurpose || filePurpose !== 'pfp') {
            return res.json({
                success: false,
                message: 'Invalid file purpose'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePhoto = null;

        if (req.file) {
            const { filename } = req.file;
            const newFile = await createAndMoveFile(filename, 'profilePhoto');
            profilePhoto = newFile._id;
        }

        const newUser = new User({
            username,
            nickname,
            password: hashedPassword,
            profilePhoto,
            role
        })
        await newUser.save();
        res.json({
            code: 201,
            success: true,
            message: "Account created!"
        })
    }

    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            code: 500,
            message: 'Internal server error'
        })
    }

}

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    try {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.send({
                success: false,
                code: 401,
                message: 'Invalid username or password'
            })
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '14d'
        });
        res.cookie('token', token, { httpOnly: true });
        res.send({
            success: true,
            code: 200,
            message: 'Login succeed'
        });
    }
    catch (err) {
        console.error(err);
    }
}

const authenticateUser = (req, res) => {
    const { username, nickname, role, pfpId } = req.user;
    return res.json({
        success: true,
        data: {
            username, nickname, role, pfpId
        }
    });
}

const getUserProfile = (req, res) => {

}

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies.token
        const blacklistedToken = new BlacklistedToken({ token, expiryDate: new Date((jwt.decode(token).iat + 14 * 24 * 3600) * 1000) });
        await blacklistedToken.save();
        res.clearCookie('token').json({
            success: true,
            message: 'Logged out'
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            code: 500
        })
    }
}

const updateUserPfp = async (req, res) => {
    try {
        const { originalname, filename } = req.file;
    }
    catch (error) {

    }
}

const getUserPfpByUserId = async (req, res) => {
    const { userId, userRole } = req.body.user;
    if (userId) {
        try {
            const user = await User.findById(userId).populate('profilePhoto');
            if (!user || !user.profilePhoto) {
                res.json({
                    success: false,
                    code: 404,
                    message: 'Profile photo not found'
                })
            }
            else {
                const pfpPath = user.profilePhoto.getFilePath();
                res.sendFile(pfpPath);
            }
        }
        catch (error) {
            console.error(error);
            res.json({
                success: false,
                code: 500,
                message: 'Internal server error'
            })
        }
    }
}

const updateUserProfile = async (req, res) => {
    const { userId, userRole } = req.body.user;
    if (userRole === 'bot') {
        res.status(401).json({
            success: false,
            message: "Role 'bot' does not support profile photo",
            code: 401
        })
    }
    else {
        try {
            const user = await User.findById(userId).populate('profilePhoto');
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                    code: 401
                })
            }
            let oldPfp = null;
            let newPfp = null;

            if (user.profilePhoto) {
                oldPfp = user.profilePhoto._id;
                oldPfpPath = user.profilePhoto.getFilePath();
                await deleteFile()
            }

            if (req.file) {
                const { filename } = req.file;
                const newFile = new File({ filename, fileType: 'profilePhoto' });
                await moveFile(filename, 'profilePhoto');
                await newFile.save();
                newPfp = newFile._id;
            }


        }
        catch (error) {

        }
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserPfp,
    updateUserProfile,
    authenticateUser,
    logoutUser
};