var n = NPos3d;
var scene = new n.Scene();
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
var getShipById = function(id){
	var result = shipMap[id];
	if(!result){
		result = new n.Ob3D({
			shape: shipShape,
			pos: [0, 0, 0],
			color: colorMap[id]
		});
		scene.add(result);
		shipMap[id] = result;
	}
	return result;
};

var encode = function(x){
	return JSON.stringify(x);
};
var decode = function(x){
	return JSON.parse(x);
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
	});
});


var clickHandler = function(e){
	socket.emit(
		'cursor',
		{
			x: scene.mpos.x,
			y: scene.mpos.y
		}
	);
};

$('*').on('click mousemove touchstart touchmove', clickHandler);
