# chatroom

vue2.0 and websocket


## Introduce

-A small real-time chat project based on vue2.0 and websocket, which supports the most basic chat functions such as user dialogue and online and offline reminders
  -Simple display of front-end pages using vue2.0
  -Processing of chat bubbles (css draws a triangle of bubbles)
  -vue-router to switch page routing
  -Inter-route communication through programmatic navigation to pass user name information
  -flex simply implements the footer part of the login page
## websocket related

[Real-time communication and websocket]
[socket.io](https://socket.io/)

### Usage

 -io.on('connection',function(){}) server monitoring, triggered when the client connects
 -io.on('disconnect',function(){}) server listens, triggered when the client disconnects
 -socket.on('event',function()()) listens to the event'event' sent by the client/server
 -io.emit('event',function()()) The server sends related events
 -socket.emit('event',function()()) client sends related events

### Distinguish:

 -socket.emit(): broadcast to the client that established **this connection**
 -socket.broadcast.emit(): broadcast to all clients except the client that established the connection (in the project, used for the user online and offline reminder part)
 -io.sockets.emit()/io.emit(): broadcast messages to all clients, including the current socket itself (the warrior part of the project used for messages)

## How to run

### npm run server

Open the console and enter `npm run server`, start the server, and monitor the client connection

### npm run dev

Open another console and enter `npm run dev` to start the client connection