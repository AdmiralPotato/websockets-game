var n = NPos3d;
var scene = new n.Scene({
	lineWidth: 2,
	backgroundColor: 'rgba(0,0,0,0.5)',
	forceRealPixels: false
});
var gameBoardHolder = new n.Ob3D({shape: {}});
gameBoardHolder.smallerAxis = 0;
gameBoardHolder.offsetAxis = 1;
gameBoardHolder.joystickOffset = 0;
gameBoardHolder.update = function(){
	this.min = Math.min(scene.cx, scene.cy);
	this.max = Math.max(scene.cx, scene.cy);
	this.smallerAxis = this.min === scene.cy ? 1 : 0;
	this.offsetAxis = 1 - this.smallerAxis;
	this.pos[this.smallerAxis] = 0;
	this.pos[this.offsetAxis] = -(this.max - this.min);
	var scale = this.min - scene.lineWidth
	this.scale[0] = scale;
	this.scale[1] = scale;
	this.scale[2] = scale;
};
scene.add(gameBoardHolder);

var Collider = function(args){
	var t = this;
	args = args || {};
	n.blessWith3DBase(t, args);
	t.id = args.id;
};
var colliderScale = 0.001;
Collider.prototype = {
	shape: n.Geom.cube,
	scale: [colliderScale, colliderScale, colliderScale],
	update: function(){
		this.rot[0] += 0.02;
		this.rot[1] += 0.02;
	}
};

var Room = function(){
	var t = this;
	t.shipMap = {};
	t.scoreMap = {};
	t.colliderList = [];
	t.gameBoard = new n.Ob3D({shape: shapes.gameBoard});
	gameBoardHolder.add(t.gameBoard);

	this.tick = function(roomData){
		t.updateRoomByData(roomData);
	};
};

Room.prototype = {
	updateRoomByData: function(roomData){
		var t = this;
		t.updateCollidersByData(roomData.colliders);
		t.updatePlayersByData(roomData.players);
	},
	updateCollidersByData: function(colliderList){
		var t = this;
		var intersectedNew = t.intersectArraysById(colliderList, t.colliderList);
		var intersectedOld = t.intersectArraysById(t.colliderList, colliderList);
		t.colliderList = intersectedOld.intersection;
		intersectedNew.notFound.forEach(function(colliderData){
			t.addCollider(colliderData);
		});
		intersectedOld.notFound.forEach(function(colliderDisplay){
			colliderDisplay.expired = true;
		});
	},
	intersectArraysById: function(listA, listB){
		var intersection = [];
		var notFound = [];
		listA.forEach(function(a){
			var aInB = false;
			for (var i = 0; i < listB.length && !aInB; i++) {
				var b = listB[i];
				aInB = a.id === b.id;
			}
			if(aInB){
				intersection.push(a);
			} else {
				notFound.push(a);
			}
		});
		return {
			intersection: intersection,
			notFound: notFound
		};
	},
	addCollider: function(colliderData){
		var collider = new Collider({
			id: colliderData.id,
			pos: [colliderData.x, colliderData.y, 0]
		});
		this.colliderList.push(collider);
		this.gameBoard.add(collider);
	},
	updatePlayersByData: function(playerList){
		var t = this;
		playerList.forEach(function(player){
			var ship = t.getShipById(player.id);
			var shipScale = t.shipStartScale + (player.score * t.shipScaleMultiplier);
			ship.scale[0] = shipScale;
			ship.scale[1] = shipScale;
			ship.scale[2] = shipScale;
			ship.pos[0] = player.x;
			ship.pos[1] = player.y;
			ship.rot[2] = player.angle;
			ship.score.string = "\n" + (player.message || player.score);
		});
	},
	shipStartScale: 0.001,
	shipScaleMultiplier: 0.0001,
	shipColorMap: {
		'0': '#f00',
		'1': '#ff0',
		'2': '#0f0',
		'3': '#09f'
	},
	getShipById: function(id){
		var t = this;
		var ship = t.shipMap[id];
		if(!ship){
			ship = new n.Ob3D({
				shape: shapes.shipShape,
				scale: [t.shipStartScale, t.shipStartScale, t.shipStartScale],
				color: t.shipColorMap[id]
			});
			ship.score = new n.VText({
				string: "0",
				pos: ship.pos,
				scale: ship.scale
			});
			t.shipMap[id] = ship;
			t.gameBoard.add(ship);
			t.gameBoard.add(ship.score);
		}
		return ship;
	}
};
