/**
 * Authentication middleware
 *
 * To authenticate JWT, check if token is blacklisted, and get user from token
 * 
 * @module authMiddleware
 * @author Jas0n2K
 * @version 0.0.2
 * 
 * @requires jsonwebtoken
 * @requires userModel
 * @requires blacklistedTokenModel
 */

import jwt from 'jsonwebtoken';
import config from '../utils/config.js';

import User from '../models/userModel.js';
import BlacklistedToken from '../models/blacklistedTokenModel.js';


export default async (req, res, next) => {
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
        return res.clearCookie('token').json({
            success: false,
            code: 401,
            message: "Invalid token"
        })
    }

    try {
        const decoded = await jwt.verify(token, config.get("JWT_SECRET"));
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.clearCookie('token').json({
                success: false,
                message: 'User not found',
                code: 401
            })
        }
        req.user = {
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            pfpId: user.profilePhoto ? user.profilePhoto._id : null,
            userId: user._id
        };
        next()
    }

    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            code: 500,
            message: 'Internal server error'
        })
    }
}