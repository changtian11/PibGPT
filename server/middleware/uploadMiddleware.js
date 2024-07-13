const multer = require('multer');
const { fileSizeLimits, tempDirPath, getFileType, isAllowedFileExts } = require('../utils/fileUtil');

const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDirPath)
    },
    filename: (req, file, cb) => {
        const desiredFileName = Date.now() + '-' + file.originalname;
        cb(null, desiredFileName);
    }
})


const upload = multer({
    storage: uploadStorage,
    limits: {
        fileSize: (req, file, cb) => {
            const filePurpose = req.body.filePurpose;
            if (filePurpose && filePurpose === 'pfp') {
                return fileSizeLimits[profilePhoto]
            }
            // Treat all other input as 'att'
            else {
                const fileType = getFileType(file.originalname);
                return fileSizeLimits[fileType];
            }
        }
    },
    fileFilter: (req, file, cb) => {
        const filePurpose = req.body.filePurpose === 'att' ? att : undefined;
        if (isAllowedFileExts(file.originalname, filePurpose)) {
            cb(null, true);
        }
        else {
            cb('Error: File type not supported', false)
        }
    }
}).single('file')

const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.json({
                success: false,
                code: 500,
                message: err.message
            })
        }
        else if (err) {
            return res.json({
                success: false,
                code: 401,
                message: err
            })
        }
        else {
            next();
        }
    })
}

module.exports = uploadMiddleware;