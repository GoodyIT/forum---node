var RDB = require('./redis.js'),
	async = require('async'),
	utils = require('../public/src/utils.js'),

	notifications = {
		get: function(nid, uid, callback) {
			RDB.multi()
				.hmget('notifications:' + nid, 'text', 'score', 'path', 'datetime', 'uniqueId')
				.zrank('uid:' + uid + ':notifications:read', nid)
				.exec(function(err, results) {
					var	notification = results[0]
						readIdx = results[1];

					callback({
						nid: nid,
						text: notification[0],
						score: notification[1],
						path: notification[2],
						datetime: notification[3],
						uniqueId: notification[4],
						read: readIdx !== null ? true : false
					});
				});
		},
		create: function(text, path, uniqueId, callback) {
			/**
			 * uniqueId is used solely to override stale nids.
			 * 		If a new nid is pushed to a user and an existing nid in the user's
			 *		(un)read list contains the same uniqueId, it will be removed, and
			 *		the new one put in its place.
			 */
			RDB.incr('notifications:next_nid', function(err, nid) {
				RDB.hmset('notifications:' + nid, {
					text: text || '',
					path: path || null,
					datetime: Date.now(),
					uniqueId: uniqueId || utils.generateUUID()
				}, function(err, status) {
					if (!err) callback(nid);
				});
			});
		},
		push: function(nid, uids, callback) {
			if (!Array.isArray(uids)) uids = [uids];

			var numUids = uids.length,
				x;

			notifications.get(nid, null, function(notif_data) {
				for (x = 0; x < numUids; x++) {
					if (parseInt(uids[x]) > 0) {
						(function(uid) {
							notifications.remove_by_uniqueId(notif_data.uniqueId, uid, function() {
								RDB.zadd('uid:' + uid + ':notifications:unread', notif_data.datetime, nid);
								global.io.sockets.in('uid_' + uid).emit('event:new_notification');
								if (callback) callback(true);
							});
						})(uids[x]);
					}
				}
			});
		},
		remove_by_uniqueId: function(uniqueId, uid, callback) {
			async.parallel([
				function(next) {
					RDB.zrange('uid:' + uid + ':notifications:unread', 0, -1, function(err, nids) {
						if (nids && nids.length > 0) {
							async.each(nids, function(nid, next) {
								notifications.get(nid, uid, function(nid_info) {
									if (nid_info.uniqueId === uniqueId) RDB.zrem('uid:' + uid + ':notifications:unread', nid);
									next();
								});
							}, function(err) {
								next();
							});
						} else next();
					});
				},
				function(next) {
					RDB.zrange('uid:' + uid + ':notifications:read', 0, -1, function(err, nids) {
						if (nids && nids.length > 0) {
							async.each(nids, function(nid, next) {
								notifications.get(nid, uid, function(nid_info) {
									if (nid_info.uniqueId === uniqueId) RDB.zrem('uid:' + uid + ':notifications:read', nid);
									next();
								});
							}, function(err) {
								next();
							});
						} else next();
					});
				}
			], function(err) {
				if (!err) callback(true);
			});
		},
		mark_read: function(nid, uid, callback) {
			if (parseInt(uid) > 0) {
				notifications.get(nid, uid, function(notif_data) {
					RDB.zrem('uid:' + uid + ':notifications:unread', nid);
					RDB.zadd('uid:' + uid + ':notifications:read', notif_data.datetime, nid);
					if (callback) callback();
				});
			}
		},
		mark_read_multiple: function(nids, uid, callback) {
			if (!Array.isArray(nids) && parseInt(nids, 10) > 0) nids = [nids];

			async.each(nids, function(nid, next) {
				notifications.mark_read(nid, uid, function(err) {
					if (!err) next(null);
				});
			}, function(err) {
				if (callback) callback(err);
			});
		},
		mark_all_read: function(uid, callback) {
			RDB.zrange('uid:' + uid + ':notifications:unread', 0, 10, function(err, nids) {
				if (err) return callback(err);

				if (nids.length > 0) {
					notifications.mark_read_multiple(nids, uid, function(err) {
						callback(err);
					});
				} else callback();
			});
		}
	}

module.exports = {
	get: notifications.get,
	create: notifications.create,
	push: notifications.push,
	mark_read: notifications.mark_read_multiple,
	mark_all_read: notifications.mark_all_read
}