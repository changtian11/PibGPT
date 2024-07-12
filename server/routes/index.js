const express = require('express');
const router = express.Router();
const path = require('path');
const apiRoutes = require('./api');

//Serve entry html files

router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', "index.html"));
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

router.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'admin.html'));
});

//Serve api

router.use('/api', apiRoutes);

module.exports = router;