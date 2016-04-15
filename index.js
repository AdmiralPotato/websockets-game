var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/resume-game/start/[a-z]-[0-3]', function(req, res){
	res.sendfile('public/play.html');
});

app.use(express.static('public'));

var roomMap = {};
var makeRandomCollider = function(){
	return {x: Math.random() * 2 - 1, y:  Math.random() * 2 - 1};
};
var makeTicker = function(roomId){
	return function(){
		//console.log(roomId, 'tick');
		var room = roomMap[roomId];
		var drag = 0.95;
		var cursorMultiplier = 0.05;
		room.players.forEach(function(player){
			player.xVel *= drag;
			player.yVel *= drag;
			player.xLast = player.x;
			player.yLast = player.y;
			player.x = asteroidsWrap(player.x + (player.xVel * cursorMultiplier));
			player.y = asteroidsWrap(player.y + (player.yVel * cursorMultiplier));
			player.score++;
			var xDiff = player.x - player.xLast;
			var yDiff = player.y - player.yLast;
			player.angle = Math.atan2(yDiff, xDiff);
		});
		io.to(roomId).emit('tick', room);
	}
};
var addColider = function(roomId){
	//roomMap.colliders
	//makeRandomCollider
};
var initialRoomState = function(roomId){
	var room = {
		players: [
			{id: '0', x: -0.5, y: -0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
			{id: '1', x:  0.5, y: -0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
			{id: '2', x:  0.5, y:  0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
			{id: '3', x: -0.5, y:  0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0}
		],
		colliders: []
	};
	roomMap[roomId] = room;
	setInterval(makeTicker(roomId), 1000/40);
	//setInterval(addCollider(roomId), 1000 * 5);
	return room;
};

initialRoomState('a');
initialRoomState('b');
initialRoomState('c');
initialRoomState('d');


var asteroidsWrap = function(n){
	var x = n;
	if(Math.abs(n) > 1){
		var inverseSign = (Math.abs(n) / n) * -1;
		x += inverseSign * 2;
	}
	return x;
};

var handleConnection = function(socket){
	try {
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
				if(
					player.xVel !== cursor.x &&
					player.yVel !== cursor.y
				){
					player.xVel = cursor.x;
					player.yVel = cursor.y;
				}
			}
		});

		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	} catch (e){
		console.log(e);
	}
};

io.on('connection', handleConnection);

http.listen(3000, function(){
	console.log('listening on *:3000');
});
