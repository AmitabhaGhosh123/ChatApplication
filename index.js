var app = require("http").createServer(handler),
    io = require("socket.io").listen(app),
    fs = require("fs");
    MongoClient = require('mongodb').MongoClient;

function handler(req, res) {
    fs.readFile(__dirname + '/index1.html.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}

var url = "mongodb://localhost:27017/node_chat";

MongoClient.connect(url, function(err , db){

    var messagesCollection = db.collection('messages');

    io.on('connection', function (socket) {
    // event for letting know which user came online
    socket.on('name',function(data){

        console.log(data+ "came online");
        socket.broadcast.emit('chat message', data+" came online");
        socket.name = data;
        // retrieving the messages from database
        messagesCollection.find().toArray().then(function (docs){

            socket.emit("chatHistory", docs);
        });
    }); // end of event 
    
    //when receiving the data from the server, push the same message to client.
    socket.on("chat message", function (msg) {
        //send the data to the current client requested/sent.
        console.log('message: '+msg);
        // insert a document in database
        messagesCollection.insertOne({text:msg}, function(err, res){

            console.log('Inserted a document into the messagesCollection');
        });

        io.emit("chat message", socket.name+" msg");
        //send the data to all the clients who are accessing the same site(localhost)
    });

    socket.on("sender", function(data) {

        socket.emit("sender", data);
        socket.broadcast.emit("sender",data);
    });

    // start of disconnect event
    socket.on('disconnect', function(){

        console.log(data+ "left the chat");
        socket.broadcast.emit('chat message', socket.name+" left the chat");
    }); // end of disconnect event

 });

});


app.listen(3000);