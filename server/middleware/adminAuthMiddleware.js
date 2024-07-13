module.exports = (req, res, next) => {
    if (req.user.role === 'bot') next();
    else return res.status(401).json({
        success: false,
        code: 401,
        message: 'Unathorized'
    })
}