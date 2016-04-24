var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js')(io);

var play = function(req, res){
	res.sendfile('public/play.html');
};

app.get('/resume-game/start/[a-z]-[0-3]', play); //matching some previously printed cards
app.get('/[a-z]-[0-3]', play);

app.use(express.static('public'));

http.listen(3000, function(){
	console.log('listening on *:3000');
});
