var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js')(io);

var play = function(req, res){
	res.sendfile('public/play.html');
};

app.get('/resume-game/start/[a-d]-[0-3]', play); //matching some previously printed cards
app.get('/[a-d]-[0-3]', play);
app.get('/[a-d]', play);

app.get('/data.json', function(req, res){
	res.sendfile('websockets-game-data.json');
});

app.use(express.static('public'));

http.listen(3000, function(){
	console.log('listening on *:3000');
});
