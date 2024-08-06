import express from "express";
const router = express.Router();
import * as path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api.js'
import staticRoutes from './static.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

router.get('/bot/:roomId?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'bot.html'));
});

router.use('/api', apiRoutes);
router.use('/static', staticRoutes);

router.get('/:roomId?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', "index.html"));
})

export default router;