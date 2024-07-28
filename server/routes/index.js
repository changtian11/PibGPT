const express = require('express');
const router = express.Router();
const path = require('path');
const apiRoutes = require('./api');
const staticRoutes = require('./static');

//Serve entry html files

router.get('/:roomId?', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', "index.html"));
})

router.get('/register', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'register.html'));
});

router.get('/bot/:roomId?', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'bot.html'));
});

router.use('/api', apiRoutes);

router.use('/static', staticRoutes);

module.exports = router;