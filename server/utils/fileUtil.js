import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export const serverDataRootPath = path.resolve(os.homedir(), 'pibgpt-server');
export const uploadDirPath = path.resolve(serverDataRootPath, 'uploads');
export const tempDirPath = path.resolve(uploadDirPath, 'temp');
export const pfpDirPath = path.resolve(uploadDirPath, 'profilePhoto');


export const allowedAttachmentExts = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'ico', 'bmp'],
    audio: ['mp3', 'wav', 'aac', 'ogg'],
    video: ['mp4', 'm4v', 'webm', 'avi', 'wmv', '3gp'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    misc: ['js', 'py']
}

export const allowedAttachmentTypes = Object.keys(allowedAttachmentExts);

export const allowedPfpExts = ['jpeg', 'jpg', 'png'];

export const fileSizeLimits = {
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

export const getFileType = (filename) => {
    const fileExt = path.extname(filename).toLowerCase().substring(1);
    for (const [type, extensions] of Object.entries(allowedAttachmentExts)) {
        if (extensions.includes(fileExt)) {
            return type;
        }
    }
    return 'other';
}

export const isAllowedFileExts = (filename, filePurpose = 'att') => {
    const fileExtension = path.extname(filename).toLowerCase().substring(1);
    if (filePurpose === 'att') {
        return Object.values(allowedAttachmentExts).flat().includes(fileExtension);
    }
    else if (filePurpose === 'pfp') {
        return allowedPfpExts.includes(fileExtension);
    }
    else return false;
}

export const getAllowedFileExts = () => Object.values(allowedAttachmentExts).flat().includes(fileExtension);

/**
 * Asynchronously create directories for various types of files.
 */

export const createUploadDirs = async () => {
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
export const moveFile = async (filename, fileType) => {
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
export const deleteFile = async (filename, fileType) => {
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