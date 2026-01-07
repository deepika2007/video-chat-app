const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server({ cors: true });

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (data) => {
        const { emailId, roomId } = data;
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);

        socket.join(roomId);
        io.to(roomId).emit('user-joined', { emailId, roomId });

        // socket.emit('joined room', { roomId });
        io.to(roomId).emit('join room', { emailId, roomId });
        console.log(`${emailId} joined room: ${roomId}`);
    });

    socket.on('call-user', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    })

    socket.on('call-accepted', ({ to, ans }) => {
        io.to(to).emit('call-accepted', { ans, from: socket.id });
    })
});

io.listen(3001, () => console.log('Socket.IO server is running on http://localhost:3001'));