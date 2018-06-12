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
namespace.on('connection', function (socket) {
  // broadcast new user
  socket.on('new user', function (username) {
    if (!userlist.includes(username)) {
      userlist.push(username);
    }
    socket.name = username;

    socket.broadcast.emit('welcome new user', 'Welcome onboard ' + username);
    namespace.emit('user list', JSON.stringify(userlist));
  });
  // user offboard
  socket.on('disconnect', function () {
    namespace.emit('goodbye', socket.name + ' is offboard');
    // update the user list
    if (userlist.includes(socket.name)) {
      userlist.splice(userlist.indexOf(socket.name), 1);
    }
    namespace.emit('user list', JSON.stringify(userlist));
  });
});



server.listen(3000, () => console.log('Example app listening on http://zhan.com:3000!'));
