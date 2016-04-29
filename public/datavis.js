var socket = io();

var dataShapeList = [];
var colorMap = Room.prototype.shipColorMap;
var cursor = { x: 0, y: 0 };
var lastDisplayedShapeIndex = 0;
var selectGameId = document.getElementById('gameId');
var selectDisplayStyle = document.getElementById('displayStyle');
var gameIdChangeHandler = function(e){
	lastDisplayedShapeIndex = parseInt(e.target.value, 10);
};
selectGameId.onchange = gameIdChangeHandler;

var dataDisplayObject = new n.Ob3D({
	shape: {},
	renderStyle: 'both',
	pos: [0, 0, -1],
	pointScale: 8
});
gameBoardHolder.add(dataDisplayObject);

socket.on('data', function(data) {
	data.forEach(function(game){
		if(game.pointList.length > 4){
			var shape = {
				points: [],
				lines: []
			};
			var getNormalizedTime = function(point){
				var time = point.timestamp - game.timeStart;
				if(time){
					time /= game.timeStop - game.timeStart;
				}
				return time * 2 -1;
			};
			var getNormalizedIndex = function(index){
				var result = index;
				if(result){
					result /= game.pointList.length;
				}
				return result * 2 -1;
			};
			game.pointList.forEach(function(point, index){
				var color = colorMap[point.player];
				shape.points.push([point.x, point.y, getNormalizedIndex(index), color]);
				if(index > 0){
					shape.lines.push([index - 1, index, color]);
				}
			});
			var option = document.createElement('option');
			option.innerText = game.id;
			option.value = dataShapeList.length; //because we're filtering empty games
			selectGameId.appendChild(option);
			selectGameId.value = option.value;
			dataShapeList.push(shape);
		}
	});
	lastDisplayedShapeIndex = dataShapeList.length -1;
	dataDisplayObject.update = function() {
		this.rot[1] = cursor.x * pi;
		this.rot[0] = -cursor.y * pi;
		this.shape = dataShapeList[lastDisplayedShapeIndex];
	};
});

var moveHandler = function(e){
	var gb = gameBoardHolder;
	var scale = gb.scale[0];
	var xOffset = gb.offsetAxis === 0 ? gb.min : 0;
	var yOffset = gb.offsetAxis === 1 ? gb.min : 0;
	cursor.x = (scene.mpos.x - xOffset) / scale * 2;
	cursor.y = (scene.mpos.y - yOffset) / scale * 2;
};
$('*').on('click mousemove touchstart touchmove', moveHandler);
