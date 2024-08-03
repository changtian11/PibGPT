const express = require('express');
const router = express.Router();
const fileCtl = require('../controllers/fileController');

router.get('/pfp/:pfpId', fileCtl.getPfpByFileId);
router.get('/file/:fileId', fileCtl.getFileByFileId);

module.exports = router;