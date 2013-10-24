//HOSTNAME
window.onload = function () {
	var chats = document.getElementById("chats");
	var chatbox = document.getElementById("chatbox");
	var start = document.getElementById("start");
	var stop = document.getElementById("stop");
	var titleArea = document.getElementById("titlearea");
	var socket = {};
	var uname = "";
	var filterIncoming = function (message) {
		message = message.replace(/me:/,"");
		var nameLength = message.search(":");
		if (nameLength != -1) {
			message = "<b>" + message.replace(":",":</b>");
		}
		var statusMessage = message.search("<<");
		if (statusMessage != -1) {
			message = "<span class='status'>" + message + "</span>";
		}
		return message;
	};
	start.addEventListener('click', function (event) {
		// build socket
		socket = new WebSocket ("ws://emilys-macbook-pro.local:8300");
		socket.onopen = function () {
			uname = prompt("What's your name?");
			socket.send(JSON.stringify({'name' : uname, 'message' : 'has just arrived'}));
		};
		var newUser = 'new';
		// prepare to receive messages
		socket.onmessage = function (message) {
			if (newUser === 'new') {
				titleArea.innerHTML = message.data + uname + "!";
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
			socket.send(chatbox.value);
			chatbox.value = "";
		}
	});
};