const chatService = require('../services/chat.sercice');
const jwt = require('jsonwebtoken');
// exports.sendMessage = async (req, res) => {
//   try {
//     const { senderId, receiverId, message } = req.body;
//     const chat = await chatService.saveMessage(senderId, receiverId, message);
//     res.status(201).json(chat);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error sending message' });
//   }
// };

// let auth = (req, res, next)=>{
//     const authHeader = req.headers['authorization'];
    
//     const token = authHeader && authHeader.split(' ')[1];
    
//     if (!token) return res.status(401).send('Access denied. No token provided.');
//     req.user = jwt.verify(token, require('./../../config/jwt.config').secret);
// }

exports.getChats = async (req, res, next) => {
    
    const { receiverUsername } = req.params;
    try {
        return res.status(200).json({
            success: true,
            chats: await chatService.getChats(req.user.username, receiverUsername)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

exports.getLastChat = async (req, res, next) => {
    
    const { receiverUsername } = req.params;
    try {
        return res.status(200).json({
            success: true,
            chat: await chatService.getLastChat(req.user.username, receiverUsername)
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};