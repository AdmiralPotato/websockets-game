var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/resume-game/start/[a-z]-[0-3]', function(req, res){
	res.sendfile('public/play.html');
});

app.use(express.static('public'));


var roomMap = {};
var makeTicker = function(roomId){
	return function(){
		//console.log(roomId, 'tick');
		var room = roomMap[roomId];
		io.to(roomId).emit('tick', room);
	}
};
var initialRoomState = function(roomId){
	var room = {
		players: [
			{id: '0', x: -100, y: -100, score: 0},
			{id: '1', x:  100, y: -100, score: 0},
			{id: '2', x:  100, y:  100, score: 0},
			{id: '3', x: -100, y:  100, score: 0}
		]
	};
	roomMap[roomId] = room;
	setInterval(makeTicker(roomId), 1000/40);
	return room;
};

initialRoomState('a');
initialRoomState('b');
initialRoomState('c');
initialRoomState('d');


var handleConnection = function(socket){
	console.log('a user connected');
	var ident;
	var room;
	var player;
	socket.on('init', function(p){
		ident = p;
		var playerIndex = parseInt(ident.id, 10);
		room = roomMap[ident.room];
		player = room.players[playerIndex];
		socket.join(ident.room);
	});

	socket.on('cursor', function(cursor){
		if(player){
			player.x = cursor.x;
			player.y = cursor.y;
		}
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
};
io.on('connection', handleConnection);

http.listen(1027, function(){
	console.log('listening on *:1027');
});
