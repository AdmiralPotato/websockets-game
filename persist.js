var JsonDB = require('node-json-db');
var db = new JsonDB("websockets-game-data", false, true);
var lastGameId = 0;
try {
	lastGameId = db.getData("/lastGameId");
} catch(e) {
	db.push("/", {
		lastGameId: 1,
		pointList: []
	});
}

var Persist = {
	getNewGameId: function(){
		var id = lastGameId++;
		db.push('/lastGameId', id);
		db.save();
		return id;
	},
	recordPoint: function(room, player, collider) {
		collider = collider || {x: 0, y: 0};
		db.push(
			"/pointList[]",
			{
				game: room.gameId,
				room: room.id,
				player: player.id,
				Score: player.score,
				x: collider.x,
				y: collider.y,
				timestamp: new Date().getTime()
			},
			true
		);
	}
};

module.exports = Persist;
