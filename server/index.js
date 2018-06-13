var express = require('express');
var app = express();
var http = require('http');

var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

// static file
app.use(express.static(path.join(__dirname + '/../public')));

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname + '/../client/welcome-page.html'));
});
app.get('/chat', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname + '/../client/chat-room.html'));
});

var namespace = io.of('/chat');
var userlist = [];
var messages = [];
namespace.on('connection', function (socket) {
  // broadcast new user
  socket.on('new user', function (username) {
    if (!userlist.includes(username)) {
      userlist.push(username);
    }
    socket.name = username;
    // on-board information
    socket.broadcast.emit('welcome message', 'Welcome onboard ' + username);
    // update user list
    namespace.emit('user list', JSON.stringify(userlist));
    // send history messages to new user
    messages.slice(-5).forEach(msg => {
      socket.emit('history messages', msg.user + ': ' + msg.message);
    });
  });

  // new message
  socket.on('new message', function(msg) {
    const newMsg = JSON.parse(msg);
    messages.push(newMsg);
    socket.broadcast.emit('propagate new message', newMsg.user + ': ' + newMsg.message);
  });

  // someone is typing
  socket.on('typing', function(user){
    socket.broadcast.emit('typing notification', user + ' is typing...');
  });

  // user offboard
  socket.on('disconnect', function () {
    socket.broadcast.emit('goodbye message', socket.name + ' is offboard');
    // update the user list
    if (userlist.includes(socket.name)) {
      userlist.splice(userlist.indexOf(socket.name), 1);
    }
    socket.broadcast.emit('user list', JSON.stringify(userlist));
  });
});



server.listen(3000, () => console.log('Example app listening on http://zhan.com:3000!'));
