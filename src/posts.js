var	RDB = require('./redis.js'),
	utils = require('./utils.js'),
	marked = require('marked'),
	user = require('./user.js');

(function(Posts) {
	//data structure
	//*global:next_post_id
	// *pid:1:content
	// *pid:1:uid
	// *pid:1:timestamp
	// ***pid:1:replies
	// *uid:1:posts



	Posts.get = function(callback, tid, start, end) {
		if (start == null) start = 0;
		if (end == null) end = start + 10;

		RDB.get('tid:' + tid + ':title', function(topic_name) { //do these asynch later
			RDB.lrange('tid:' + tid + ':posts', start, end, function(pids) {
				var content = [],
					uid = [],
					timestamp = [],
					pid = [],
					post_rep = [];

				for (var i=0, ii=pids.length; i<ii; i++) {
					content.push('pid:' + pids[i] + ':content');
					uid.push('pid:' + pids[i] + ':uid');
					timestamp.push('pid:' + pids[i] + ':timestamp');
					post_rep.push('pid:' + pids[i] + ':rep');		
					pid.push(pids[i]);
				}

				if (pids.length > 0) {
					RDB.multi()
						.mget(content)
						.mget(uid)
						.mget(timestamp)
						.mget(post_rep)
						.exec(function(err, replies) {
							content = replies[0];
							uid = replies[1];
							timestamp = replies[2];
							post_rep = replies[3];

							user.get_user_postdetails(uid, function(user_details) {
								user.get_gravatars_by_uids(uid, 80, function(gravatars) {
									var posts = [];
									var callbacks = content.length;

									for (var i=0, ii=content.length; i<ii; i++) {
										(function(i) {
											Posts.hasFavourited(pid[i], uid[i], function(hasFavourited) {
												posts.push({
													'pid' : pid[i],
													'content' : marked(content[i] || ''),
													'uid' : uid[i],
													'username' : user_details.username[i] || 'anonymous',
													'user_rep' : user_details.rep[i] || 0,
													'post_rep' : post_rep[i] || 0,
													'gravatar' : gravatars[i],
													'timestamp' : timestamp[i],
													'relativeTime': utils.relativeTime(timestamp[i]),
													'fav_star_class' : hasFavourited ? 'icon-star' : 'icon-star-empty' 
												});
												
												callbacks--;
												if (callbacks == 0) {
													callback({'topic_name':topic_name, 'topic_id': tid, 'posts': posts});
												}
											});
										}(i));
									}
								});
							});
						});
				} else {
					callback({});
				}
			});
		});


	}


	Posts.reply = function(socket, tid, uid, content) {
		Posts.create(uid, tid, content, function(pid) {
			RDB.rpush('tid:' + tid + ':posts', pid);

			socket.emit('event:alert', {
				title: 'Reply Successful',
				message: 'You have successfully replied. Click here to view your reply.',
				type: 'notify',
				timeout: 2000
			});
		});
	};

	Posts.create = function(uid, tid, content, callback) {
		if (uid === null) return;
		
		RDB.incr('global:next_post_id', function(pid) {
			// Posts Info
			RDB.set('pid:' + pid + ':content', content);
			RDB.set('pid:' + pid + ':uid', uid);
			RDB.set('pid:' + pid + ':timestamp', new Date().getTime());
			
			RDB.incr('tid:' + tid + ':postcount');
			
			// User Details - move this out later
			RDB.lpush('uid:' + uid + ':posts', pid);
			
			if (callback) callback(pid);
		});

	}


	Posts.favourite = function(socket, pid) {
		RDB.get('pid:' + pid + ':uid', function(uid) {
			Posts.hasFavourited(pid, uid, function(hasFavourited) {
				if (hasFavourited == false) {
					RDB.sadd('pid:' + pid + ':users_favourited', uid);
					RDB.incr('uid:' + uid + ':rep');
					RDB.incr('pid:' + pid + ':rep');
				}
			});
			
		});
	}

	Posts.unfavourite = function(socket, pid) {
		RDB.get('pid:' + pid + ':uid', function(uid) {
			Posts.hasFavourited(pid, uid, function(hasFavourited) {
				if (hasFavourited == true) {
					RDB.srem('pid:' + pid + ':users_favourited', uid);
					RDB.decr('uid:' + uid + ':rep');
					RDB.decr('pid:' + pid + ':rep');
				}
			});
			
		});
	}

	Posts.hasFavourited = function(pid, uid, callback) {
		RDB.sismember('pid:' + pid + ':users_favourited', uid, function(hasFavourited) {
			callback(hasFavourited);
		});
	}
}(exports));