const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
// const auth = require('../helpers/jwt.verify');

router.get('/:receiverUsername',chatController.getChats);
router.get('/last/:receiverUsername',chatController.getLastChat);

module.exports = router;
