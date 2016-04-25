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
	var joystockHolder = new n.Ob3D({shape: {}});
	joystockHolder.update = function() {
		var gb = gameBoardHolder;
		this.pos[gb.smallerAxis] = 0;
		this.pos[gb.offsetAxis] = gb.min;
		n.Maths.pointAt(this, scene.camera.pos);
	};
	scene.add(joystockHolder);
	var joystick = new n.Ob3D({
		shape: shapes.joystick,
		color: '#999',
		rotOrder: [2,1,0]
	});
	joystick.update = function(){
		var gb = gameBoardHolder;
		var scale = gb.min / 2;
		this.scale[0] = scale;
		this.scale[1] = scale;
		this.scale[2] = scale;
		this.rot[0] = cursor.x * -joystickInfluence;
		this.rot[1] = cursor.y * -joystickInfluence + (pi / 2);
	};
	joystockHolder.add(joystick);
	var isActive = false;
	var onOffHandler = function(e){
		isActive = 'mousedown keydown touchstart'.indexOf(e.type) !== -1;
	};
	var axisList = ['x', 'y'];
	var moveHandler = function(e){
		var gb = gameBoardHolder;
		var scale = gb.scale[0]
		var xOffset = gb.offsetAxis === 0 ? gb.min : 0;
		var yOffset = gb.offsetAxis === 1 ? gb.min : 0;
		var x = (scene.mpos.x - xOffset) / scale * 2;
		var y = (scene.mpos.y - yOffset) / scale * 2;
		var angle = Math.atan2(y, x);
		var lengthMax = 1;
		var length = Math.sqrt(x*x + y*y);
		var correctedLength = Math.min(length, lengthMax);
		cursor.x = cos(angle) * correctedLength;
		cursor.y = sin(angle) * correctedLength;
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
