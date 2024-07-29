const os = require('os');
const path = require('path');
const fs = require('fs');
const serverDataRootPath = path.resolve(os.homedir(), 'pibgpt-server');
console.log('Server root data path: ' + serverDataRootPath)
const uploadDirPath = path.resolve(serverDataRootPath, 'uploads');
const tempDirPath = path.resolve(uploadDirPath, 'temp');
const pfpDirPath = path.resolve(uploadDirPath, 'profilePhoto');


const allowedAttachmentExts = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    audio: ['mp3', 'wav', 'aac', 'ogg'],
    video: ['mp4', 'm4v', 'webm', 'avi', 'wmv', '3gp'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    misc: ['js', 'py']
}

const allowedAttachmentTypes = Object.keys(allowedAttachmentExts);

const allowedPfpExts = ['jpeg', 'jpg', 'png'];

const fileSizeLimits = {
    image: 5 * 1024 * 1024,
    audio: 5 * 1024 * 1024,
    video: 20 * 1024 * 1024,
    profilePhoto: 5 * 1024 * 1024,
    document: 10 * 1024 * 1024,
    misc: 5 * 1024 * 1024,
    other: 5 * 1024 * 1024
}

/**
 * Judge the file type by its filename.
 * @param {string} filename 
 * @returns {string} Type of the file
 */

const getFileType = (filename) => {
    const fileExt = path.extname(filename).toLowerCase().substring(1);
    for (const [type, extensions] of Object.entries(allowedAttachmentExts)) {
        if (extensions.includes(fileExt)) {
            return type;
        }
    }
    return 'other';
}

const isAllowedFileExts = (filename, filePurpose = 'att') => {
    const fileExtension = path.extname(filename).toLowerCase().substring(1);
    if (filePurpose === 'att') {
        return Object.values(allowedAttachmentExts).flat().includes(fileExtension);
    }
    else if (filePurpose === 'pfp') {
        return allowedPfpExts.includes(fileExtension);
    }
    else return false;
}

/**
 * Asynchronously create directories for various types of files.
 */

const createUploadDirs = async () => {
    const dirPaths = [tempDirPath, pfpDirPath, ...Object.keys(allowedAttachmentExts).map(dir => path.resolve(uploadDirPath, dir))];

    await Promise.all(dirPaths.map(async dirPath => {
        try {
            if (!fs.existsSync(dirPath)) await fs.promises.mkdir(dirPath, { recursive: true });
        }
        catch (err) {
            console.error(err);
            console.error(`Error creating dir: ${dirPath}`);
            process.exit(1)
        }
    }))
}

// const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);


/** 
 * Asynchronously move the file uploaded to temp dir to its final path.
 * @param {string} filename 
 * @param {string} fileType 
 */
const moveFile = async (filename, fileType) => {
    const tempPath = path.join(tempDirPath, filename);
    const finalPath = path.join(uploadDirPath, fileType, filename);

    try {
        const finalFolder = path.join(uploadDirPath, fileType)
        if (!fs.existsSync(finalFolder)) await fs.promises.mkdir();
        await fs.promises.rename(tempPath, finalPath);
    }

    catch (err) {
        console.error(`Error moving file ${filename}: ${err}`);
        throw err;
    }
}

/** 
 * Asynchronously remove the file from its type folder.
 * @param {string} filename 
 * @param {string} fileType 
 */
const deleteFile = async (filename, fileType) => {
    const currentPath = path.join(uploadDirPath, fileType, filename);
    const finalPath = path.join(tempDirPath, filename);

    try {
        await fs.rename(currentPath, finalPath);
    }
    catch (err) {
        console.error(`Error moving file: ${err}`);
        throw err;
    }
}

module.exports = {
    allowedAttachmentTypes,
    uploadDirPath,
    tempDirPath,
    fileSizeLimits,
    createUploadDirs,
    getFileType,
    isAllowedFileExts,
    moveFile,
    deleteFile
}