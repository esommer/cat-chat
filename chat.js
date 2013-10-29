//HOSTNAME
window.onload = function () {
	
	var chats = document.getElementById("chats");
	var chatbox = document.getElementById("chatbox");
	var start = document.getElementById("start");
	var stop = document.getElementById("stop");
	var titleArea = document.getElementById("titlearea");
	var chatterList = document.getElementById("chatterlist");
	var chatters = document.getElementById("chatters");
	var socket = {};
	var userName = "";

	start.focus();
	
	var sendMessage = function (messageType, messageText, name) {
		var msgObj = {
			'from' : userName ,
			'msgType' : messageType ,
			'message' : messageText
		}
		var data = JSON.stringify(msgObj);
		socket.send(data);
	};

	var ReceivedMessage = function (message) {
		this.obj = JSON.parse(message);
		this.msgType = this.obj['msgType'];
		this.msgBody = this.obj['message'];
		this.from = this.obj['from'];
	}

	var buildMsgLi = function (msg) {
		var newli = document.createElement('li');
		var msgHTML = "";
		if (msg.from !== userName) {
			msgHTML = "<b>" + msg.from + ":</b> " + msg.msgBody;
		}
		else {
			msgHTML = msg.msgBody;
			newli.className = 'self';
		}
		// if (msg.msgType == 'status') {
		// 	newli.className = 'status';
		// }
		newli.innerHTML = msgHTML;
		chats.appendChild(newli);
		var scroll = chats.scrollTop + 50;
		chats.scrollTop = scroll;
	};

	var updateUsers = function (msgBody) {
		chatterList.innerHTML = "";
		for (var key in msgBody) {
			var userli = document.createElement('li');
			userli.innerHTML = msgBody[key];
			chatterList.appendChild(userli);
		}
	}

	var setChatState = function (state) {
		if (state == 'on') {
			chatbox.className = '';
			stop.className = '';
			start.className = 'hidden';
			chats.className = '';
			chatters.className = '';
		} else {
			stop.className = 'hidden';
			start.className = '';
			chats.className = 'hidden';
			chatbox.className = 'hidden';
			titleArea.innerHTML = "Might you want to chat?";
			chatters.className = 'hidden';
		}
	}
	
	var handleMessage = function (msg) {
		switch (msg.msgType) {
			case ('welcome'):
				titleArea.innerHTML = msg.msgBody + userName + "!";
				setChatState('on');
				chatbox.focus();
				break;
			case ('error'):
				// handle error messages
				switch (msg.msgBody) {
					case ('username already in use'):
						userName = prompt("That username was already in use. Please choose another: ");
						sendMessage('enter', 'opening connection', userName);
						break;
					default:
						break;
				}
				break;
			case ('text'):
				buildMsgLi(msg);
				break;
			case ('userList'): 
				updateUsers(msg.msgBody);
				break;
			default:
				break;
		}
	}

	start.addEventListener('click', function (event) {
		socket = new WebSocket ("ws://emilys-macbook-pro.local:8300");
		socket.onopen = function () {
			userName = prompt("What's your name?");
			sendMessage('enter','opening connection', userName);
		};
		socket.onmessage = function (message) {
			var msg = new ReceivedMessage (message.data);
			handleMessage(msg);
		}
	});	
	
	stop.addEventListener('click', function (event) {
		// DISCONNECT: if socket is open, tell server to cut you off, close, re-hide ui elements
		if (socket.readyState == 1) {
			sendMessage('exit','',userName);
			socket.close();
			setChatState('off');
		}
	});
	
	chatbox.addEventListener('focus', function (event) {
		// clear input box on entry
		chatbox.value = "";
	})
	
	chatbox.addEventListener('keydown', function (event) {
		// send message on "enter" in input box
		if (event.keyCode == 13 && socket.readyState == 1) {
			sendMessage('text', chatbox.value);
			// reset input box
			chatbox.value = "";
		}
	});
};