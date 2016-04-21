var Game = function(io){
	var roomMap = {};
	var makeRandomCollider = function(){
		return {
			id: Math.random(),
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1
		};
	};
	var intersectColliders = function(room){
		var nextColliders = [];
		var hitRadius = 0.05;
		var winningScore = 20;
		var gameOver = false;
		for (var i = 0; i < room.colliders.length && !gameOver; i++) {
			var collider = room.colliders[i];
			var hit = false;
			for (var j = 0; j < room.players.length && !gameOver; j++) {
				var player = room.players[j];
				var xDiff = collider.x - player.x;
				var yDiff = collider.y - player.y;
				var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
				if(distance < hitRadius){
					hit = true;
					player.score++;
					if(player.score >= winningScore){
						gameOver = true;
						resetGame(room.id, player);
					}
				}
			}
			if(!hit && !gameOver){
				nextColliders.push(collider);
			}
		}
		if(!gameOver){
			room.colliders = nextColliders;
		}
	};
	var resetGame = function(roomId, winningPlayer){
		var room = roomMap[roomId];
		room.players.forEach(function(player){
			player.score = 0;
		});
		if(winningPlayer){
			winningPlayer.messageCountdown = 80;
			winningPlayer.message = "Winner!";
		}
		room.colliders.length = 0;

	};
	var updatePlayers = function(room){
		var drag = 0.95;
		var cursorMultiplier = 0.05;
		room.players.forEach(function(player){
			if(Math.abs(player.xVel) + Math.abs(player.xVel) > 0.0001){
				player.xVel *= drag;
				player.yVel *= drag;
				player.xLast = player.x;
				player.yLast = player.y;
				player.x = asteroidsWrap(player.x + (player.xVel * cursorMultiplier));
				player.y = asteroidsWrap(player.y + (player.yVel * cursorMultiplier));
				var xDiff = player.x - player.xLast;
				var yDiff = player.y - player.yLast;
				player.angle = Math.atan2(yDiff, xDiff);
				if(player.messageCountdown){
					player.messageCountdown--;
				} else {
					player.messageCountdown = undefined;
					player.message = undefined;
				}
			}
		});
	};
	var makeTicker = function(roomId){
		return function(){
			//console.log(roomId, 'tick');
			var room = roomMap[roomId];
			updatePlayers(room);
			intersectColliders(room);
			io.to(roomId).emit('tick', room);
		}
	};
	var makeColliderAdder = function(roomId){
		return function(){
			var colliders = roomMap[roomId].colliders;
			if(colliders.length < 20){
				colliders.push(makeRandomCollider());
			}
		}
	};
	var initializeRoomById = function(roomId){
		var room = {
			id: roomId,
			players: [
				{id: '0', x: -0.5, y: -0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
				{id: '1', x:  0.5, y: -0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
				{id: '2', x:  0.5, y:  0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0},
				{id: '3', x: -0.5, y:  0.5, angle: 0, score: 0, xLast: 0, yLast: 0, xVel: 0, yVel: 0}
			],
			colliders: []
		};
		roomMap[roomId] = room;
	};
	var initialRoomState = function(roomId){
		initializeRoomById(roomId);
		setInterval(makeTicker(roomId), 1000/40);
		setInterval(makeColliderAdder(roomId), 1000 * 3);
	};

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

	initialRoomState('a');
	initialRoomState('b');
	initialRoomState('c');
	initialRoomState('d');

	io.on('connection', handleConnection);
};

module.exports = function(io){return new Game(io);};
