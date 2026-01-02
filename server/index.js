const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server({ cors: true });
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const emailToSocketMapping = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (data) => {
        const { emailId, roomId } = data;
        emailToSocketMapping.set(emailId, socket.id);
        socket.join(roomId);

        socket.emit('joined room', { roomId });
        socket.broadcast.to(roomId).emit('user joined', { emailId });
        console.log(`${emailId} joined room: ${roomId}`);
    });

    // socket.on('disconnect', () => {
    //     console.log('A user disconnected');
    // });
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
io.listen(3001, () => console.log('Socket.IO server is running on http://localhost:3001'));