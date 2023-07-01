const express = require('express');
const router = express.Router();
const userStatusController = require('../controllers/status.controller');

// Route to fetch user status data
router.get('/status/exceptMe', userStatusController.getUserStatusExceptMe);
router.get('/status', userStatusController.getUserStatus);

module.exports = router;
