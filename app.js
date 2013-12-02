var http = require('http');
var file = require('fs');
var urlParser = require('url');
var WebSocketServer = require('ws').Server;



var requestHandler = function (request, response) {
	var path = urlParser.parse(request.url).pathname.toString().replace(/^\//, '');
	switch (request.method) {
		case ('GET'):
			getFile(path, response, buildResponse);
			break;
		case ('POST'):
			break;
		default:
			break;
	}
};

var server = http.createServer(requestHandler);
server.listen(process.env.PORT);
console.log('Server running at ' + process.env.PORT);
console.log('Server PID: ' + process.pid);




// CHAT SERVER:

var ws_server = new WebSocketServer ({server : server});
var activeUsers = {};

var User = function (socket) {
	this.socket = socket;
	this.name = "";
}

User.prototype.send = function (messageType, messageText, senderName) {
	var msgObj = {
		'msgType' : messageType ,
		'message' : messageText ,
		'from' : senderName
	}
	var data = JSON.stringify(msgObj);
	if (this.socket.readyState === 1) {
		this.socket.send(data);
	}
	else {
		this.exit();
	}
}

User.prototype.exit = function () {
	this.socket.close();
	console.log(this.name + " left chat");
	delete activeUsers[this.name];
	broadcast('userList', Object.keys(activeUsers), 'server');
}

var ReceivedMessage = function (message) {
	this.obj = JSON.parse(message);
	this.msgType = this.obj['msgType'];
	this.msgBody = this.obj['message'];
	this.from = this.obj['from'];
}

ws_server.on('connection', function (socket) {
	var user = new User(socket);

	user.socket.on('message', function (message) {
		var msg = new ReceivedMessage (message);
		if (msg.msgType == 'enter' && user.name !== msg.from) {
			// check unique username:
			if (activeUsers[msg.from] || msg.from == 'server') {
				// username already taken, send response back
				user.send('error', 'username already in use', 'server');
			}
			else {
				user.name = msg.from;
				activeUsers[user.name] = user;
				console.log('new user: ' + user.name);
				user.send('welcome', 'Welcome to the room, ', user.name);
				broadcast('userList', Object.keys(activeUsers), 'server');
			}
		}
		else if (msg.msgType == 'exit') {
			activeUsers[msg.from].exit();
		}
		else {
			broadcast('text', msg.msgBody, user.name);
		}
	})
});

var broadcast = function (messageType, messageText, sender) {
	var senderName = (typeof sender == "string")? sender: sender.name;
	for (var key in activeUsers) {
		activeUsers[key].send(messageType, messageText, senderName);
	}
};







// BASIC HTTP SERVER STUFF:

var getFile = function (path, response, callback) {
	var fileType = getFileType(path);
	file.readFile(path, function (error, data) {
		if (error) {
			console.log(error);
			buildResponse(response, undefined, undefined, error);
		}
		if (data) { callback(response, data, fileType); }
	});
}

var getFileType = function (path) {
	var type = "";
	var fileTypes = {
		'.html$' : 'text-plain',
		'.jpeg$' : 'image',
		'.jpg$' : 'image',
		'.ico$' : 'image/x-icon',
		'.css$' : 'text/css',
		'.js$' : 'application/javascript'
	};
	for (var key in fileTypes) {
		if (path.search(key) != -1) {
			type = fileTypes[key];
		}
	}
	return type;
};

var buildResponse = function (response, data, fileType, error) {
	if (error) {
		response.writeHead(404, {'Content-Type' : 'text-plain'});
		response.end('<html><head><title>Error</title><style>body { color: #555; font-family: Helvetica, sans-serif; font-size: 4em; font-weight: 300; text-align: center; margin-top: 100px; }</style></head><body>:( File not found. Apologies!</body></html>');
	}
	else {
		response.writeHead(200, {'Content-Type' : fileType });
		response.end(data);
	}
}









