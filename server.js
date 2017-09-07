var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http),
 MongoClient = require('mongodb').MongoClient;

app.use(express.static('public'));

var url = 'mongodb://localhost:27017/node_chat';

MongoClient.connect(url, function(err , db) {

	var messagesCollection = db.collection('messages');
	    connectedSockets = [];

	io.on("connection", function(socket) {

	console.log('A user connected');

	if (connectedSockets.indexOf(socket) === -1) {

		connectedSockets.push(socket);
	}

	messagesCollection.find().toArray().then(function (docs) {

		socket.emit("chatHistory", docs);
	}); 

	socket.on("message", function(message){

		console.log('message: '+message);

		messagesCollection.insertOne({text:message}, function(err , res) {

			console.log('Inserted a document into messagesCollection');
		});

		socket.broadcast.emit("message", message);
	});

	socket.on("username", function(username) {

		socket.chatUsername = username;
		socket.broadcast.emit("username", {

			username : username,
			id : socket.id
		});

		var connectedUsersList2 = connectedSockets.map(function (item) {

		return {

			id : item.id,
			username : item.chatUsername
		}

		socket.broadcast.emit("newConnectedUser", connectedUsersList2);
	});

	});

// start of show connected clients	

	socket.on("askForConnectedClients", function(nothing, cb) {

		var connectedUsersList = connectedSockets.map(function(item) {

			return {

				id : item.id,
				username : item.chatUsername
			}
		});

		cb(connectedUsersList);
	}); // end of show connected clients

	socket.on("disconnect", function() {

		console.log("Client disconnected");
		var index = connectedSockets.indexOf(socket);
		connectedSockets.splice(index , 1);
		console.log('Currently '+connectedSockets.length + ' clients connected');

		var connectedUsersList2 = connectedSockets.map(function (item) {

		return {

			id : item.id,
			username : item.chatUsername
		}
	});
		socket.broadcast.emit("newDisconnectedUser", connectedUsersList2);
	});

  });

});



http.listen(3000 , function () {

	console.log('Express application started');
});