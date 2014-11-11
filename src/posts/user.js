'use strict';

var async = require('async'),

	db = require('../database'),
	user = require('../user'),
	groups = require('../groups'),
	meta = require('../meta'),
	websockets = require('../socket.io'),
	postTools = require('../postTools'),
	plugins = require('../plugins'),
	privileges = require('../privileges');


module.exports = function(Posts) {

	Posts.getUserInfoForPosts = function(uids, uid, callback) {
		async.parallel({
			groups: function(next) {
				groups.getUserGroups(uids, next);
			},
			userData: function(next) {
				user.getMultipleUserFields(uids, ['uid', 'username', 'userslug', 'reputation', 'postcount', 'picture', 'signature', 'banned', 'status'], next);
			},
			online: function(next) {
				websockets.isUsersOnline(uids, next);
			}
		}, function(err, results) {
			if (err) {
				return callback(err);
			}

			var userData = results.userData;
			for(var i=0; i<userData.length; ++i) {
				userData[i].groups = results.groups[i];
				userData[i].status = results.online[i] ? (userData[i].status || 'online') : 'offline';
			}

			async.map(userData, function(userData, next) {
				userData.uid = userData.uid || 0;
				userData.username = userData.username || '[[global:guest]]';
				userData.userslug = userData.userslug || '';
				userData.reputation = userData.reputation || 0;
				userData.postcount = userData.postcount || 0;
				userData.banned = parseInt(userData.banned, 10) === 1;
				userData.picture = userData.picture || user.createGravatarURLFromEmail('');

				async.parallel({
					signature: function(next) {
						if (parseInt(meta.config.disableSignatures, 10) === 1) {
							userData.signature = '';
							return next();
						}
						postTools.parseSignature(userData, uid, next);
					},
					customProfileInfo: function(next) {
						plugins.fireHook('filter:posts.custom_profile_info', {profile: [], uid: userData.uid}, next);
					}
				}, function(err, results) {
					if (err) {
						return next(err);
					}

					userData.custom_profile_info = results.customProfileInfo.profile;

					plugins.fireHook('filter:posts.modifyUserInfo', userData, next);
				});
			}, callback);
		});
	};

	Posts.isOwner = function(pid, uid, callback) {
		uid = parseInt(uid, 10);
		if (Array.isArray(pid)) {
			if (!uid) {
				return callback(null, pid.map(function() {return false;}));
			}
			Posts.getPostsFields(pid, ['uid'], function(err, posts) {
				if (err) {
					return callback(err);
				}
				posts = posts.map(function(post) {
					return post && parseInt(post.uid, 10) === uid;
				});
				callback(null, posts);
			});
		} else {
			if (!uid) {
				return callback(null, false);
			}
			Posts.getPostField(pid, 'uid', function(err, author) {
				callback(err, parseInt(author, 10) === uid);
			});
		}
	};

	Posts.isModerator = function(pids, uid, callback) {
		if (!parseInt(uid, 10)) {
			return callback(null, pids.map(function() {return false;}));
		}
		Posts.getCidsByPids(pids, function(err, cids) {
			if (err) {
				return callback(err);
			}
			user.isModerator(uid, cids, callback);
		});
	};

	Posts.getPostsByUid = function(callerUid, uid, start, end, callback) {
		async.waterfall([
			function(next) {
				user.getPostIds(uid, start, end, next);
			},
			function(pids, next) {
				privileges.posts.filter('read', pids, callerUid, next);
			},
			function(pids, next) {
				Posts.getPostSummaryByPids(pids, callerUid, {stripTags: false}, next);
			},
			function(posts, next) {
				next(null, {posts: posts, nextStart: end + 1});
			}
		], callback);
	};

	Posts.getFavourites = function(uid, start, end, callback) {
		async.waterfall([
			function(next) {
				db.getSortedSetRevRange('uid:' + uid + ':favourites', start, end, next);
			},
			function(pids, next) {
				Posts.getPostSummaryByPids(pids, uid, {stripTags: false}, next);
			},
			function(posts, next) {
				callback(null, {posts: posts, nextStart: end + 1});
			}
		], callback);
	};

};
