/**
 * Authentication middleware
 *
 * To authenticate JWT, check if token is blacklisted, and get user from token
 * 
 * @module authMiddleware
 * @author Jas0n2K
 * @version 0.0.1
 * 
 * @requires jsonwebtoken
 * @requires userModel
 * @requires blacklistedTokenModel
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const BlacklistedToken = require('../models/blacklistedTokenModel');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({
            success: false,
            code: 401,
            message: 'No token provided'
        })
    }

    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
        res.clearCookie('token');
        return res.json({
            success: false,
            code: 401,
            message: "Invalid token"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.clearCookie('token');
            return res.json({
                success: false,
                message: 'User not found',
                code: 401
            })
        }
        console.log(user);
        req.user = {
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            pfpId: user.profilePhoto ? user.profilePhoto._id : null
        };
        next()
    }

    catch (error) {
        console.log(error);
        res.clearCookie('token');
        return res.json({
            success: false,
            code: 401,
            message: 'Invalid token'
        })
    }
}

module.exports = authMiddleware;