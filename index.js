var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js')(io);

app.get('/resume-game/start/[a-z]-[0-3]', function(req, res){
	res.sendfile('public/play.html');
});

app.use(express.static('public'));

http.listen(3000, function(){
	console.log('listening on *:3000');
});
