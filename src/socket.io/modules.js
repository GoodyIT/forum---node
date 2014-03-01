"use strict";

var	posts = require('../posts'),
	postTools = require('../postTools'),
	topics = require('../topics'),
	meta = require('../meta'),
	Messaging = require('../messaging'),
	user = require('../user'),
	notifications = require('../notifications'),
	plugins = require('../plugins'),

	async = require('async'),
	S = require('string'),
	winston = require('winston'),
	server = require('./'),

	SocketModules = {};

/* Posts Composer */

SocketModules.composer = {
	replyHash: {}
};

SocketModules.composer.push = function(socket, pid, callback) {
	if (socket.uid || parseInt(meta.config.allowGuestPosting, 10)) {
		if (parseInt(pid, 10) > 0) {

			async.parallel([
				function(next) {
					posts.getPostFields(pid, ['content'], next);
				},
				function(next) {
					topics.getTopicDataByPid(pid, next);
				},
				function(next) {
					posts.getPidIndex(pid, next);
				}
			], function(err, results) {
				if(err) {
					return callback(err);
				}
				callback(null, {
					pid: pid,
					body: results[0].content,
					title: results[1].title,
					topic_thumb: results[1].thumb,
					index: results[2]
				});
			});
		}
	} else {
		callback(new Error('no-uid'));
	}
};

SocketModules.composer.editCheck = function(socket, pid, callback) {
	posts.getPostField(pid, 'tid', function(err, tid) {
		if (err) {
			return callback(err);
		}

		postTools.isMain(pid, tid, function(err, isMain) {
			callback(err, {
				titleEditable: isMain
			});
		});
	});
};

SocketModules.composer.renderPreview = function(socket, content, callback) {
	plugins.fireHook('filter:post.parse', content, callback);
};

SocketModules.composer.renderHelp = function(socket, data, callback) {
	plugins.fireHook('filter:composer.help', '', callback);
};

SocketModules.composer.register = function(socket, data) {
	server.in('topic_' + data.tid).emit('event:topic.replyStart', data.uid);

	data.socket = socket;
	data.timer = setInterval(function() {
		// Ping the socket to see if the composer is still active
		socket.emit('event:composer.ping', data.uuid);
	}, 1000*10);	// Every 10 seconds...

	SocketModules.composer.replyHash[data.uuid] = data;
};

SocketModules.composer.pingInactive = function(socket, uuid) {
	var	data = SocketModules.composer.replyHash[uuid];
	if (SocketModules.composer.replyHash[uuid]) {
		server.in('topic_' + data.tid).emit('event:topic.replyStop', data.uid);
		clearInterval(data.timer);
		delete SocketModules.composer.replyHash[uuid];
	}
};

/* Chat */

SocketModules.chats = {};

SocketModules.chats.get = function(socket, data, callback) {
	if(!data) {
		return callback(new Error('invalid data'));
	}

	Messaging.getMessages(socket.uid, data.touid, callback);
};

SocketModules.chats.send = function(socket, data) {
	if(!data) {
		return callback(new Error('invalid data'));
	}

	var touid = data.touid;
	if (touid === socket.uid || socket.uid === 0) {
		return;
	}

	var msg = S(data.message).stripTags().s;

	user.getMultipleUserFields([socket.uid, touid], ['username', 'userslug', 'picture'], function(err, usersData) {
		if(err) {
			return;
		}

		var username = usersData[0].username,
			toUsername = usersData[1].username,
			finalMessage = username + ' : ' + msg,
			notifText = 'New message from <strong>' + username + '</strong>';

		if (!module.parent.exports.isUserOnline(touid)) {
			notifications.create({
				text: notifText,
				path: 'javascript:app.openChat(&apos;' + username + '&apos;, ' + socket.uid + ');',
				uniqueId: 'notification_' + socket.uid + '_' + touid,
				from: socket.uid
			}, function(nid) {
				notifications.push(nid, [touid], function(success) {

				});
			});
		}

		usersData[0].uid = socket.uid;
		usersData[1].uid = touid;

		Messaging.parse(msg, socket.uid, socket.uid, usersData[1], usersData[0], true, function(parsed) {
			Messaging.addMessage(socket.uid, touid, msg, function(err, message) {


				server.getUserSockets(touid).forEach(function(s) {
					s.emit('event:chats.receive', {
						fromuid: socket.uid,
						username: username,
						message: parsed,
						timestamp: Date.now()
					});
				});

				server.getUserSockets(socket.uid).forEach(function(s) {
					s.emit('event:chats.receive', {
						fromuid: touid,
						username: toUsername,
						message: parsed,
						timestamp: Date.now()
					});
				});
			});
		});
	});
};

SocketModules.chats.list = function(socket, data, callback) {
	Messaging.getRecentChats(socket.uid, callback);
};

/* Notifications */

SocketModules.notifications = {};

SocketModules.notifications.mark_read = function(socket, nid) {
	notifications.mark_read(nid, socket.uid);
};

SocketModules.notifications.mark_all_read = function(socket, data, callback) {
	notifications.mark_all_read(socket.uid, callback);
};

module.exports = SocketModules;