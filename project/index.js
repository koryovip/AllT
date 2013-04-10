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

var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"JGIhyIMHSCyr90oZjvxRvg", //twitter appで発行されたConsumer keyを入力。
	"ReDJ3Wn2xIBS6nvNIW1tzT5rc861jCWkjtsnWMsDCk", //twitter appで発行されたConsumer secretを入力。
	"1.0",
	"http://127.0.0.1:8888/twitter/callback",
	"HMAC-SHA1"
);

app.get('/twitter', function (req, res) {
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
		if (error) {
			console.log(error);
			res.send("yeah no. didn't work.");
		} else {
		    console.log(oauth_token);
		    console.log(oauth_token_secret);
		    console.log(results);

		  	req.session["oauth"] = {};
		  	req.session.oauth.token = oauth_token;
		  	console.log('oauth.token: ' + req.session.oauth.token);
		  	req.session.oauth.token_secret = oauth_token_secret;
		  	console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
		  	res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
		}
	});
});

var twit = null;

app.get('/twitter/callback', function (req, res) {
	if (req.session.oauth.token &&
		req.session.oauth.token_secret &&
		req.session.oauth.access_token &&
		req.session.oauth.access_token_secret) {

		console.log("=2======================================================")
		console.log('oauth.token: ' + req.session.oauth.token);
		console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
		console.log('oauth_access_token: ' + req.session.oauth.access_token);
		console.log('oauth_access_token_secret: ' + req.session.oauth.access_token_secret);
		console.log("=2======================================================")

		twit = new twitter({
			consumer_key: 'JGIhyIMHSCyr90oZjvxRvg',
			consumer_secret: 'ReDJ3Wn2xIBS6nvNIW1tzT5rc861jCWkjtsnWMsDCk',
			access_token_key: req.session.oauth.access_token,
			access_token_secret: req.session.oauth.access_token_secret
		});

		twit.get('/statuses/home_timeline.json', {'count': 20, 'include_entities': true}, function(err, result) {
			console.log(result);
		});
	} else {
		if (req.session.oauth) {
			req.session.oauth.verifier = req.query.oauth_verifier;
			var oauth = req.session.oauth;
			oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
			function(error, oauth_access_token, oauth_access_token_secret, results){
				if (error){
					console.log(error);
					res.send("yeah something broke.");
				} else {
					req.session.oauth.access_token = oauth_access_token;
					req.session.oauth.access_token_secret = oauth_access_token_secret;

					console.log("=======================================================")
					console.log('oauth.token: ' + req.session.oauth.token);
					console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
					console.log('oauth_access_token: ' + oauth_access_token);
					console.log('oauth_access_token_secret: ' + oauth_access_token_secret);
					console.log("=======================================================")
					console.log(results);
					console.log("=======================================================")
					//res.send(results.screen_name + "<br/>worked. nice one.");
					//res.sendfile(__dirname + '/index.html');
					res.redirect('http://127.0.0.1:8888');
				}
			});
		} else {
			next(new Error("you're not supposed to be here."));
		}
	}
});

app.get('/get', function(req, res) {
    var twit = new twitter({
    	consumer_key: 'JGIhyIMHSCyr90oZjvxRvg',
    	consumer_secret: 'ReDJ3Wn2xIBS6nvNIW1tzT5rc861jCWkjtsnWMsDCk',
    	access_token_key: req.session.oauth.access_token,
    	access_token_secret: req.session.oauth.access_token_secret
    });
    
    twit.get('/statuses/home_timeline.json', {'count': 200, 'include_entities': true}, function(err, result) {
    	console.log(result);
        res.json(result);
    });
});

app.get('/*', function (req, res) {
	console.log(req.route.params[0]);
	res.sendfile(__dirname + '/' + req.route.params[0]);
});