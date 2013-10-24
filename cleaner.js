var http = require('http');
var file = require('fs');
var urlParser = require('url');
var WebSocketServer = require('ws').Server;


var dataStore = {};

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

server.listen(8300, "emilys-macbook-pro.local");
console.log('Server running at http://127.0.0.1:8300');
console.log('Server PID: ' + process.pid);
//server.on('request', requestHandler (request, response));


var ws_server = new WebSocketServer ({server : server});
var activeUsers = {};

var User = function (socket) {
	this.id = socket.upgradeReq.headers['sec-websocket-key'];
	this.socket = socket;
	this.name = "";
	this.state = 'newbie';
}

User.prototype.send = function (message) {
	if (this.socket.readyState === 1) {
		this.socket.send(message);
	}
	else {
		console.log(activeUsers[this.id][this.name]);
		//broadcast("<<" + activeUsers[this.id][this.name] + " has left >>");
		//delete activeUsers[this.id];
	}
}

ws_server.on('connection', function (socket) {
	var user = new User(socket);
	activeUsers[user.id] = user;
	user.send('Welcome to the room, ');
	user.socket.on('message', function (message) {
		// if (message === "<<STOP>>") {
		// 	broadcast("<< " + user.name + " has left >>");
		// 	delete activeUsers[user.id];
		// }
		if (user.state == 'newbie') {
			user.name = JSON.parse(message)['name'];
			console.log('new user: ' + user.name);
			broadcast('<< just joined >>', user);
			user.state = 'pro';
		}
		else {
			console.log('received: ' + message);
			broadcast(message, user);
		}
	})
});

var broadcast = function (message, user) {
	for (var key in activeUsers) {
		if (activeUsers[key] == user) {
			if (user.state == 'pro') {
				user.send("me: " + message);
			}
		} 
		else {
			activeUsers[key].send(user.name + ": " + message);
		}
	}
};




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









