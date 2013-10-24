//HOSTNAME
window.onload = function () {
	
	var chats = document.getElementById("chats");
	var chatbox = document.getElementById("chatbox");
	var start = document.getElementById("start");
	var stop = document.getElementById("stop");
	var titleArea = document.getElementById("titlearea");
	var socket = {};
	var userName = "";
	var userID = "";
	
	var ReceivedMessage = function (message) {
		this.obj = JSON.parse(message);
		this.msgType = this.obj['msgType'];
		this.msgBody = this.obj['message'];
		this.from = this.obj['from'];
	}

	var MessageToSend = function (messageType, messageText, name) {
		this.obj = {
			'from' : userID ,
			'msgType' : messageType ,
			'message' : messageText
		}
		if (name) this.obj['name'] = name;
		return this.obj;
	};

	var filterIncoming = function (message) {
		var msg = new ReceivedMessage (message);
		if (msg.from) {
			msg.msgBody = "<b>" + msg.msgBody.replace(":",":</b>");
		}
		if (msg.msgType == 'status') {
			msg.msgBody = "<span class='status'>" + msg.msgBody + "</span>";
		}
		return msg.msgBody;
	};
	
	start.addEventListener('click', function (event) {
		
		// build socket
		socket = new WebSocket ("ws://emilys-macbook-pro.local:8300");
		socket.onopen = function () {
			userName = prompt("What's your name?");
			var msg = new MessageToSend ('enter','opening connection', userName);
			socket.send(JSON.stringify(msg));
		};
		var newUser = 'new';
		
		// prepare to receive messages
		socket.onmessage = function (message) {
			if (newUser === 'new') {
				titleArea.innerHTML = message.data + userName + "!";
				newUser = 'once';
				chatbox.className = '';
				stop.className = '';
				start.className = 'hidden';
				chats.className = '';
			}
			else {
				var fancymessage = filterIncoming(message.data);
				var newli = document.createElement('li');
				newli.innerHTML = fancymessage;
				if (message.data.search('me:') == 0) {
					newli.className = 'right';
				}
				chats.appendChild(newli);
				var scroll = chats.scrollTop + 50;
				chats.scrollTop = scroll;
			}
		}
	});	
	
	stop.addEventListener('click', function (event) {
		if (socket.readyState == 1) {
			socket.send("<<STOP>>");
			socket.close();
			stop.className = 'hidden';
			start.className = '';
		}
	});
	
	chatbox.addEventListener('focus', function (event) {
		chatbox.value = "";
	})
	
	chatbox.addEventListener('keydown', function (event) {
		if (event.keyCode == 13 && socket.readyState == 1) {
			var msg = new MessageToSend ('text', chatbox.value);
			socket.send(JSON.stringify(msg));
			chatbox.value = "";
		}
	});
};