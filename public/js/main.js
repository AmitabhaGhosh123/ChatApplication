$(document).ready(function(){

	var socket = io(),
	    chatForm = $(".chat-form"),
	    messageField = chatForm.find("#message-field"),
	    messagesList = $(".messages-list"),
	    chatUsername,
	    chatUsernameIndicator = $(".current-username"),
	    usernameSubmit = $(".username-submit"),
	    usernameField = $(".username"),
	    usersList = $(".users-list");

	chatForm.on("submit", function(e) {

		e.preventDefault();
		var message = messageField.val();
		messagesList.append("<li>"+message+"</li>");
		socket.emit("message", message);
	});

	socket.on("message", function(message){

		messagesList.append("<li>"+message+"</li>");

	});

	socket.on("chatHistory", function(data) {

		messagesList.find("li").remove();
		$.each(data, function() {

			messagesList.append("<li>"+this.text+"</li>");
		});
	});

	socket.on("connect", function() {

		if ($.cookie("node_chat_username")) {

			chatUsername = $.cookie("node_chat_username");
		}

		else{

			chatUsername = 'Anonymous'+(new Date()).getTime();
		}

		$.cookie("node_chat_username", chatUsername);
		chatUsernameIndicator.text(chatUsername);
		socket.emit("username", chatUsername);

		socket.emit("askForConnectedClients", null, function(users) {

			usersList.empty();
			$.each(users, function() {

				usersList.append("<li>"+this.username+"</li>");
			});
		});

	});

		socket.on("newConnectedUser", function(users) {

			usersList.empty();
			$.each(users, function() {

				usersList.append("<li>"+this.username+"</li>");
			});
		});

		socket.on("newDisConnectedUser", function(users) {

			usersList.empty();
			$.each(users, function() {

				usersList.append("<li>"+this.username+"</li>");
			});
		});

	    usernameSubmit.on("click", function () {

	    	chatUsername = usernameField.val();
	    	$.cookie("node_chat_username", usernameField.val());
	    	chatUsernameIndicator.text(usernameField.val());
	    	socket.emit("username", chatUsername);
	    }); 

	    socket.on("username", function(data){

	    	console.log(data);
	    });
});