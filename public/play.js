var socket = io();
var split = window.location.pathname.split("/").pop().split('-');
socket.emit(
	'init',
	{
		room: split[0],
		id: split[1]
	}
);

var room = new Room();
socket.on('tick', room.tick);

var clickHandler = function(e){
	var cursor = {
		x: scene.mpos.x / gameBoardHolder.scale[0] * 2,
		y: scene.mpos.y / gameBoardHolder.scale[0] * 2
	};
	socket.emit('cursor',cursor);
};
$('*').on('click mousemove touchstart touchmove', clickHandler);
