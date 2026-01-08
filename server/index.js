const express = require("express");
const { Server } = require("socket.io");

const app = express();

const io = new Server(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const emailToSocket = new Map();
const socketToEmail = new Map();
const socketToRoom = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* -------------------- JOIN ROOM -------------------- */

  socket.on("join-room", ({ emailId, roomId }) => {
    emailToSocket.set(emailId, socket.id);
    socketToEmail.set(socket.id, emailId);
    socketToRoom.set(socket.id, roomId);

    socket.join(roomId);

    // Notify others only
    socket.to(roomId).emit("user-joined", {
      emailId,
      socketId: socket.id,
      roomId
    });

    console.log(`${emailId} joined room ${roomId}`);
  });

  /* -------------------- CALL EVENTS -------------------- */

  socket.on("call-user", ({ to, offer }) => {
    if (!io.sockets.sockets.get(to)) return;

    io.to(to).emit("incoming:call", {
      from: socket.id,
      offer,
    });
  });

  socket.on("call-accepted", ({ to, ans }) => {
    if (!io.sockets.sockets.get(to)) return;

    io.to(to).emit("call-accepted", {
      from: socket.id,
      ans,
    });
  });

  /* -------------------- WEBRTC NEGOTIATION -------------------- */

  socket.on("peer:negotiationneeded", ({ to, offer }) => {
    if (!io.sockets.sockets.get(to)) return;

    io.to(to).emit("peer:negotiationneeded", {
      from: socket.id,
      offer,
    });
  });

  socket.on("peer:negotiationdone", ({ to, ans }) => {
    if (!io.sockets.sockets.get(to)) return;

    io.to(to).emit("peer:negotiationfinal", {
      from: socket.id,
      ans,
    });
  });

  /* -------------------- DISCONNECT -------------------- */

  socket.on("disconnect", () => {
    const email = socketToEmail.get(socket.id);
    const roomId = socketToRoom.get(socket.id);

    if (roomId) {
      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
        email,
      });
    }

    emailToSocket.delete(email);
    socketToEmail.delete(socket.id);
    socketToRoom.delete(socket.id);

    console.log("User disconnected:", socket.id);
  });
});
