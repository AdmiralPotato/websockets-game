var JsonDB = require('node-json-db');
var db = new JsonDB("websockets-game-data", false, false);
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
	recordPoint: function(room, player) {
		db.push(
			"/pointList[]",
			{
				gameId: room.gameId,
				roomId: room.id,
				playerId: player.id,
				playerScore: player.score,
				timestamp: new Date().getTime
			},
			true
		);
	}
};

module.exports = Persist;
