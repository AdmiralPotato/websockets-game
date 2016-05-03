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
var displayStyleMap = {
	default: function(game, point, index, vert){
		vert[0] = point.x;
		vert[1] = point.y;
		vert[2] = getNormalizedIndex(game, index);
	},
	scoreOverTime: function(game, point, index, vert){
		vert[0] = (parseInt(point.player, 10) - 2) / 2;
		vert[1] = point.Score / 20;
		vert[2] = getNormalizedTime(game, point);
	}
};
var getNormalizedTime = function(game, point){
	var time = point.timestamp - game.timeStart;
	if(time){
		time /= game.timeStop - game.timeStart;
	}
	return time * 2 -1;
};
var getNormalizedIndex = function(game, index){
	var result = index;
	if(result){
		result /= game.pointList.length;
	}
	return result * 2 -1;
};

for(var displayStyleName in displayStyleMap){
	if(displayStyleMap.hasOwnProperty(displayStyleName)){
		var option = document.createElement('option');
		option.value = displayStyleName;
		option.innerText = displayStyleName;
		selectDisplayStyle.appendChild(option);
	}
}
selectDisplayStyle.onchange = function(){};

socket.on('data', function(data) {
	data.forEach(function(game){
		if(game.pointList.length > 4){
			var shape = {
				points: [],
				lines: [],
				game: game
			};
			game.pointList.forEach(function(point, index){
				var color = colorMap[point.player];
				shape.points.push([0, 0, 0, color]);
				if(index > 0){
					shape.lines.push([index - 1, index, color]);
				}
			});
			var option = document.createElement('option');
			option.innerText = game.id + ' - ' + game.pointList.length + ' points';
			option.value = dataShapeList.length; //because we're filtering empty games
			selectGameId.appendChild(option);
			selectGameId.value = option.value;
			dataShapeList.push(shape);
		}
	});
	lastDisplayedShapeIndex = dataShapeList.length -1;
});
var activeDisplayStyle = '';
dataDisplayObject.update = function() {
	this.rot[1] = cursor.x * pi * 0.5;
	this.rot[0] = -cursor.y * pi * 0.5;
	if(
		activeDisplayStyle !== selectDisplayStyle.value ||
		this.shape !== dataShapeList[lastDisplayedShapeIndex]
	){
		this.shape = dataShapeList[lastDisplayedShapeIndex];
		if(this.shape && this.shape.game){
			activeDisplayStyle = selectDisplayStyle.value;
			var game = this.shape.game;
			this.shape.points.forEach(function(vert, index){
				displayStyleMap[activeDisplayStyle](game, game.pointList[index], index, vert);
			});
		}
	}
};
var moveHandler = function(e){
	var gb = gameBoardHolder;
	var scale = gb.scale[0];
	var xOffset = gb.offsetAxis === 0 ? gb.min : 0;
	var yOffset = gb.offsetAxis === 1 ? gb.min : 0;
	cursor.x = (scene.mpos.x - xOffset) / scale * 2;
	cursor.y = (scene.mpos.y - yOffset) / scale * 2;
};
$('*').on('click mousemove touchstart touchmove', moveHandler);
