var n = NPos3d;
var scene = new n.Scene();
var socket = io();
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
		[4, 5, '#ff0'],
		[5, 6, '#ff0'],
		[6, 7, '#ff0'],
		[7, 4, '#ff0'],
		[4, 0],
		[5, 1],
		[6, 2],
		[7, 3]
	]
};

socket.on('cursorUpdate', function(msg){
	console.log(msg);
	var data = decode(msg);
	var newShip = new n.Ob3D({
		shape: shipShape,
		pos: [data[0], data[1], 0],
		color: '#9f0'
	});
	scene.add(newShip);
});


var clickHandler = function(e){
	socket.emit(
		'cursor',
		encode([
			e.clientX,
			e.clientY
		])
	);
};

$('*').on('click touch', clickHandler);


