var express = require('express')
  , http = require('http')
  , path = require('path')
  , OAuth = require('oauth').OAuth //node-oauthをrequire
  , twitter = require('ntwitter');

var app = express();
app.configure(function(){
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	//express -s をつけると以下の2行が付きます。
	app.use(express.cookieParser('your secret here'));
	app.use(express.session({ secret: "string" }));
});

var server = require('http').createServer(app);
//var io = require('socket.io').listen(server, {log: false, rememberTransport: false});
server.listen(8888);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/*', function (req, res) {
	console.log(req.route.params[0]);
	res.sendfile(__dirname + '/' + req.route.params[0]);
});