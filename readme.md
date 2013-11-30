catchat
========

A simple web-socket-based chat client in node.js WITHOUT using express.js or socket.io.

###To Do:
This app is quite incomplete: it was really just a way for me to learn about web sockets and using node.js all by itself. After reading the RFC specs on web socket client-server handshakes, I decided to use [ws](https://github.com/einaros/ws) to help with the initial web socket connection. Other than that, this is all vanilla js.
- Clean user input
- Get rid of pop-up that asks for name
- Ping clients occasionally to detect when they've disconnected

##License:
? Free for all.
