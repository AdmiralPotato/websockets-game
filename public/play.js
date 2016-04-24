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
	var joystickScale = 1;
	var joystick = new n.Ob3D({
		shape: shapes.joystick,
		color: '#999',
		scale: [joystickScale, joystickScale, joystickScale]
	});
	gameBoardHolder.add(joystick);
	var isActive = false;
	var cursor = { x: 0, y: 0 };
	var joystickInfluence = pi / 8;
	var onOffHandler = function(e){
		if('mousedown touchstart'.indexOf(e.type) !== -1){
			isActive = true;
		} else {
			isActive = false;
		}
	};
	var moveHandler = function(e){
		cursor.x = scene.mpos.x / gameBoardHolder.scale[0] * 2;
		cursor.y = scene.mpos.y / gameBoardHolder.scale[0] * 2;
		joystick.rot[0] = cursor.y * -joystickInfluence;
		joystick.rot[1] = cursor.x * joystickInfluence;
	};
	var cursorEmitter = function(){
		if(isActive){
			socket.emit('cursor', cursor);
		}
	};
	setInterval(cursorEmitter, 1000 / 40);
	$('*').on('click mousemove touchstart touchmove', moveHandler);
	$('*').on('mousedown mouseup touchstart touchend', onOffHandler);
}
