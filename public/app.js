var n = NPos3d;
var scene = new n.Scene({
	lineWidth: 2
});
var gameBoard = new n.Ob3D({
	shape: {
		points: [
			[-1, -1, 0],
			[ 1, -1, 0],
			[ 1,  1, 0],
			[-1,  1, 0],
		],
		lines: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0]
		]
	}
});
gameBoard.update = function(){
	var min = Math.min(scene.cx, scene.cy) - scene.lineWidth;
	this.scale[0] = min;
	this.scale[1] = min;
};
scene.add(gameBoard);
var socket = io();
var split = window.location.pathname.split("/start/")[1].split('-');

socket.emit(
	'init',
	{
		room: split[0],
		id: split[1]
	}
);

var colorMap = {
	'0': '#f00',
	'1': '#ff0',
	'2': '#0f0',
	'3': '#09f'
};
var shipMap = {};
var scoreMap = {};
var getShipById = function(id){
	var ship = shipMap[id];
	if(!ship){
		var shipScale = 0.005;
		ship = new n.Ob3D({
			shape: shipShape,
			pos: [0, 0, 0],
			scale: [shipScale, shipScale, shipScale],
			color: colorMap[id]
		});
		shipMap[id] = ship;
		scoreMap[id] = new n.VText({
			string: "0",
			pos: ship.pos,
			scale: ship.scale
		});
		gameBoard.add(ship);
		gameBoard.add(scoreMap[id]);
	}
	return ship;
};
var shipShape = {
	points: [
		[-10,  0, 0],
		[-20,-20, 0],
		[ 20,  0, 0],
		[-20, 20, 0],
		[ -5,  0, 5],
		[-10, -9, 5],
		[  5,  0, 5],
		[-10,  9, 5]
	],
	lines: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4],
		[4, 0],
		[5, 1],
		[6, 2],
		[7, 3]
	]
};

socket.on('tick', function(room){
	room.players.forEach(function(player){
		var ship = getShipById(player.id);
		ship.pos[0] = player.x;
		ship.pos[1] = player.y;
		ship.rot[2] = player.angle;
		scoreMap[player.id].string = "\n" + player.score;
	});
});


var clickHandler = function(e){
	var cursor = {
		x: scene.mpos.x / gameBoard.scale[0],
		y: scene.mpos.y / gameBoard.scale[0]
	};
	socket.emit('cursor',cursor);
};

$('*').on('click mousemove touchstart touchmove', clickHandler);
