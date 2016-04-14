var express = require('express');
var session = require('express-session');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(session({
	genid: function(req) {
		return Math.random(); // use UUIDs for session IDs
	},
	secret: 'keyboard cat'
}));

app.get('/start/[a-z]-[0-3]', function(req, res){
	res.sendfile('public/index.html');
});

app.use(express.static('public'));


var handleConnection = function(socket){
	console.log('a user connected');
	var player;
	socket.on('init', function(p){
		player = p;
		socket.join(player.room);
	});

	socket.on('cursor', function(cursor){
		cursor.id = player.id;
		io.to(player.room).emit('cursorUpdate', cursor);
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
};
io.on('connection', handleConnection);

http.listen(3000, function(){
	console.log('listening on *:3000');
});
