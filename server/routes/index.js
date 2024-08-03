const express = require('express');
const router = express.Router();
const path = require('path');
const apiRoutes = require('./api');
const staticRoutes = require('./static');

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

module.exports = router;