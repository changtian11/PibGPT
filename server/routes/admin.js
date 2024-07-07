const express = require('express');
const router = express.Router();
const path = require('path');

// Serve the registration page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/register.html'));
});

// Serve the admin interface
router.get('/pit-admin', (req, res) => {
    res.sendFile(path.join(__dirname, '/pit-admin.html'));
});

module.exports = router;