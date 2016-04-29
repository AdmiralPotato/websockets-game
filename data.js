var Data = function(io, persist){
	var pointList = persist.getPointList();
	var gameMap = {};
	var gameList = [];
	var getGameById = function(id){
		var result = gameMap[id];
		if(!result){
			result = {
				id: id,
				pointList: [],
				timeStart: 0,
				timeStop: 0
			};
			gameMap[id] = result;
			gameList.push(result);
		}
		return result;
	};
	var buildGameMap = function(){
		pointList.forEach(function(point){
			var game = getGameById(point.game);
			game.pointList.push(point);
			if(!game.timeStart){
				game.timeStart = point.timestamp;
				game.timeStop = point.timestamp;
			} else {
				game.timeStart = Math.min(game.timeStart, point.timestamp);
				game.timeStop = Math.max(game.timeStop, point.timestamp);
			}
		});
	};
	buildGameMap();
	var handleConnection = function(socket){
		socket.emit('data', gameList);
	};
	io.on('connection', handleConnection);
};

module.exports = function(io, persist){return new Data(io, persist);};
