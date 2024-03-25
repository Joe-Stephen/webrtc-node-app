const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use("/", express.static("public"));

io.on("connection", (socket) => {
  console.log("Server 1: new web socket connection");
  console.log("Connection id :", socket.id); 
  socket.emit("message", "Welcome to Server 1.");
  socket.emit(
    "message",
    "Your web socket connection with Server 1 is now active."
  );
  socket.on("join", (roomId) => {
    const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 };
    const numberOfClients = roomClients.length;

    //these events are only emitted to the sender socket
    if (numberOfClients == 0) {
      console.log(
        `Creating room ${roomId} and emitting room_created socket event.`
      );
      socket.join(roomId);
      socket.emit("room_created", roomId);
    } else if (numberOfClients == 1) {
      console.log(
        `Creating room ${roomId} and emitting room_created socket event.`
      );
      socket.join(roomId);
      socket.emit("room_created", roomId);
    } else {
      console.log(`Can't join room ${roomId}, emitting full_room socket event`);
      socket.emit("full_room", roomId);
    }
  });

  //these events are emitted to all the sockets connected to same room except the sender
  socket.on("start_call", (roomId) => {
    console.log(`Broadcasting start call event to peers in room : ${roomId}`);
    socket.broadcast.to(roomId).emit("start_call");
  });
  socket.on("webrtc_offer", (event) => {
    console.log(
      `Broadcasting webrtc_offer event to peers in room : ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_offer", event.sdp);
  });
  socket.on("webrtc_answer", (event) => {
    console.log(
      `Broadcasting webrtc_answer event to peers in room : ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_answer", event.sdp);
  });
  socket.on("webrtc_ice_candidate", (event) => {
    console.log(
      `Broadcasting webrtc_ice_candidate event to peers in room : ${event.roomId}`
    );
    socket.broadcast.to(event.roomId).emit("webrtc_ice_candidate", event.sdp);
  });
});

//starting the server
const port = process.env.port || 5000;
server.listen(port, () => {
  console.log(`Server is running on port :${port}`);
});
