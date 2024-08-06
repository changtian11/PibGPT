import express from 'express';
const router = express.Router();
import * as fileCtl from '../controllers/fileController.js';

router.get('/pfp/:pfpId', fileCtl.getPfpByFileId);
router.get('/file/:fileId', fileCtl.getFileByFileId);

export default router;