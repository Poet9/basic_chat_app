const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage } = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');
const { callbackify } = require('util');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket)=>{
   socket.on('join query', ({ username, room}, callback)=>{
      const {error, user}= addUser({
         id: socket.id,
         username,
         room
      });
      if(error){
         return callback(error);
      }
      let notif = `${user.username} has joined`;
      socket.join(user.room);
      socket.broadcast.to(user.room).emit('notification', generateMessage(user.username,notif));
      io.to(user.room).emit('roomData', {
         room: user.room,
         users: getUsersInRoom(user.room)
      });
      callback();
   });

   socket.on('chat message', (msg)=>{
      const user = getUser(socket.id);
      socket.broadcast.to(user.room).emit('chat message', generateMessage(user.username,msg));
      socket.emit('my message', generateMessage(user.username, msg));
    });

   socket.on('location', (coords)=>{
      const user = getUser(socket.id);
      io.to(user.room).emit('shared location', generateMessage(user.username,`https://google.com/maps?q=${coords.longitude},${coords.latitude}`));
   });

   socket.on('disconnect', ()=>{
      const user = removeUser(socket.id);
      if(user){
         notif = `${user.username} has left the chat`;
         socket.broadcast.to(user.room).emit('notification', generateMessage(user.username, notif));
      }
   });
});

server.listen(port, ()=>{
   console.log('listening on port', port);
});