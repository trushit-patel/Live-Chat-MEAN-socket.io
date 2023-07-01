const io = require('socket.io')({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const jwt = require('jsonwebtoken');
const Chat = require('./app/models/chat.models');
const userService = require('./app/services/user.service');
const userStatusService = require('./app/services/status.service');

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    jwt.verify(token, require('./config/jwt.config.js').secret, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.decoded = decoded;
        next();
    });
});

connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.decoded.username);
    connectedUsers.set(String(socket.decoded.username), socket);
    broadCastUserStatusChangeEvent(String(socket.decoded.username), true);

    socket.emit('acknowledgement', "you are now connected");

    socket.on('client-msg', async (data) => {
        if (userService.getByUsername(data.reciever)) {

            if (connectedUsers.has(data.reciever)) {
                connectedUsers.get(data.reciever).emit('client-msg', { message: data.message, sender: socket.decoded.username, timestamp: data.timestamp});
            }

            //user exists but not connected
            const newChat = new Chat({
                sender: socket.decoded.username,
                receiver: data.reciever,
                message: data.message,
                timestamp: new Date()
            });

            await newChat.save();
        }
        else socket.emit('404', { message: 'no such user' });
    });

    socket.on('file', (data) => {
        // HERE FILE INSTEAD OF MESSAGE { file: {payload: data.file.payload, mimeType: data.file.type , fileName: file.name}, reciever: String(this.recieverUsername), timestamp: Date }
        if (connectedUsers.has(data.reciever))
            connectedUsers.get(data.reciever).emit('file', { file: data.file, sender: socket.decoded.username, timestamp: data.timestamp });
        else socket.emit('404', { message: 'no such user' });
    });

    // Log when the client disconnects
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.decoded.username);
        connectedUsers.delete(String(socket.decoded.username));
        broadCastUserStatusChangeEvent(String(socket.decoded.username), false);
    });
});

broadCastUserStatusChangeEvent = async (username, status) => {
    user = await userStatusService.updateUserStatus(await userService.getByUsername(username), status);
    io.emit('user-status-change', user);
}

module.exports = io;
