var socket = io();
var split = window.location.pathname.split("/").pop().split('-');

var room = new Room();
socket.on('tick', room.tick);

if(split.length === 1){
	socket.emit('watch',split[0]);
} else {
	socket.emit(
		'init',
		{
			room: split[0],
			id: split[1]
		}
	);
	var clickHandler = function(e){
		var cursor = {
			x: scene.mpos.x / gameBoardHolder.scale[0] * 2,
			y: scene.mpos.y / gameBoardHolder.scale[0] * 2
		};
		socket.emit('cursor',cursor);
	};
	$('*').on('click mousemove touchstart touchmove', clickHandler);
}
