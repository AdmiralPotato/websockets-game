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
	var cursor = { x: 0, y: 0 };
	var joystickInfluence = pi / 8;
	var joystick = new n.Ob3D({
		shape: shapes.joystick,
		color: '#999'
	});
	joystick.update = function(){
		var gb = gameBoardHolder;
		var scale = gb.min / 2;
		joystick.scale[0] = scale;
		joystick.scale[1] = scale;
		joystick.scale[2] = scale;
		joystick.pos[gb.smallerAxis] = 0;
		joystick.pos[gb.offsetAxis] = gb.min;
		joystick.rot[0] = cursor.y * -joystickInfluence;
		joystick.rot[1] = cursor.x * joystickInfluence;
	};
	scene.add(joystick);
	var isActive = false;
	var onOffHandler = function(e){
		isActive = 'mousedown keydown touchstart'.indexOf(e.type) !== -1;
	};
	var axisList = ['x', 'y'];
	var moveHandler = function(e){
		var gb = gameBoardHolder;
		var scale = gb.scale[0]
		var xOffset = !gb.offsetAxis ? gb.min: 0;
		var yOffset = gb.min - xOffset;
		cursor.x = (scene.mpos.x - xOffset) / scale * 2;
		cursor.y = (scene.mpos.y - yOffset) / scale * 2;
	};
	var cursorEmitter = function(){
		if(isActive){
			socket.emit('cursor', cursor);
		}
	};
	setInterval(cursorEmitter, 1000 / 40);
	$('*').on('click mousemove touchstart touchmove', moveHandler);
	$('*').on('mousedown mouseup mouseout keydown keyup touchstart touchend', onOffHandler);
}
