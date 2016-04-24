var socket = io();
socket.emit('watch');

var roomList = [];
var s = 0.5;
var roomScale = [s,s,s];
var roomPositions = [
	[-s, -s, 0],
	[ s, -s, 0],
	[ s,  s, 0],
	[-s,  s, 0]
];
var watchLoop = function(roomList){
	roomList.forEach(function(roomData, index){
		var room = getRoomByIndex(index);
		room.updateRoomByData(roomData);
	})
};
var getRoomByIndex = function(index){
	var room = roomList[index];
	if(!room){
		room = new Room();
		roomList[index] = room;
		room.gameBoard.scale = roomScale;
		room.gameBoard.pos = roomPositions[index];
	}
	return room;
};

socket.on('tick', watchLoop);
