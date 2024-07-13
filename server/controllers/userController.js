const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { createNewFile } = require('../controllers/fileController');

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
            const newFile = await createNewFile(filename, 'profilePhoto');
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
    console.log(password);
    const user = await User.findOne({ username });
    console.log(user);
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
        if (user.role === 'bot') {
            res.redirect('/bot');
        } else {
            res.send({
                success: true,
                code: 200,
                message: 'Login succeed'
            });
        }
    }
    catch (err) {
        console.error(err);
    }
}

const authenticateUser = (req, res) => {
    return res.json(req.user);
}

const getUserProfile = async (req, res) => {
    try {

    }
    catch (error) {

    }
}

const updateUserPfp = async (req, res) => {
    try {
        const { originalname, filename } = req.file;
    }
    catch (error) {

    }
}

const getUserPfp = async (req, res) => {
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

module.exports = { registerUser, loginUser, getUserProfile, getUserPfp, updateUserPfp, updateUserProfile, authenticateUser };