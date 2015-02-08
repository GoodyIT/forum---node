'use strict';

var async = require('async'),

	db = require('./database'),
	posts = require('./posts'),
	topics = require('./topics'),
	categories = require('./categories'),
	user = require('./user'),
	plugins = require('./plugins'),
	privileges = require('./privileges'),
	utils = require('../public/src/utils');

var search = {};

module.exports = search;

search.search = function(data, callback) {
	function done(err, data) {
		if (err) {
			return callback(err);
		}

		result.search_query = query;
		if (searchIn === 'titles' || searchIn === 'titlesposts') {
			searchIn = 'posts';
		}
		result[searchIn] = data.matches;
		result.matchCount = data.matchCount;
		result.hidePostedBy = searchIn !== 'posts';
		result.time = (process.elapsedTimeSince(start) / 1000).toFixed(2);
		callback(null, result);
	}

	var start = process.hrtime();

	var query = data.query;
	var searchIn = data.searchIn || 'titlesposts';

	var result = {
		posts: [],
		users: [],
		tags: []
	};

	if (searchIn === 'posts' || searchIn === 'titles' || searchIn === 'titlesposts') {
		searchInContent(query, data, done);
	} else if (searchIn === 'users') {
		searchInUsers(query, data.uid, done);
	} else if (searchIn === 'tags') {
		searchInTags(query, done);
	} else {
		callback(new Error('[[error:unknown-search-filter]]'));
	}
};

function searchInContent(query, data, callback) {
	data.uid = data.uid || 0;
	async.parallel({
		pids: function(next) {
			if (data.searchIn === 'posts' || data.searchIn === 'titlesposts') {
				searchQuery('post', query, next);
			} else {
				next(null, []);
			}
		},
		tids: function(next) {
			if (data.searchIn === 'titles' || data.searchIn === 'titlesposts') {
				searchQuery('topic', query, next);
			} else {
				next(null, []);
			}
		},
		searchCategories: function(next) {
			getSearchCategories(data, next);
		}
	}, function (err, results) {
		if (err) {
			return callback(err);
		}

		var matchCount = 0;
		if (!results || (!results.pids.length && !results.tids.length)) {
			return callback(null, {matches: [], matchCount: matchCount});
		}

		async.waterfall([
			function(next) {
				getMainPids(results.tids, next);
			},
			function(mainPids, next) {
				results.pids.forEach(function(pid) {
					if (mainPids.indexOf(pid) === -1) {
						mainPids.push(pid);
					}
				});
				privileges.posts.filter('read', mainPids, data.uid, next);
			},
			function(pids, next) {
				filterAndSort(pids, data, results.searchCategories, next);
			},
			function(pids, next) {
				matchCount = pids.length;
				if (data.page) {
					var start = Math.max(0, (data.page - 1)) * 10;
					pids = pids.slice(start, start + 10);
				}

				posts.getPostSummaryByPids(pids, data.uid, {stripTags: true, parse: false}, next);
			},
			function(posts, next) {
				next(null, {matches: posts, matchCount: matchCount});
			}
		], callback);
	});
}

function filterAndSort(pids, data, searchCategories, callback) {
	async.parallel({
		posts: function(next) {
			getMatchedPosts(pids, data, searchCategories, next);
		},
		postedByUid: function(next) {
			if (data.postedBy) {
				user.getUidByUsername(data.postedBy, next);
			} else {
				next();
			}
		}
	}, function(err, results) {
		if (err) {
			return callback(err);
		}
		if (!results.posts) {
			return callback(null, pids);
		}
		var posts = results.posts.filter(Boolean);

		posts = filterByUser(posts, results.postedByUid);
		posts = filterByCategories(posts, searchCategories);
		posts = filterByPostcount(posts, data.replies, data.repliesFilter);
		posts = filterByTimerange(posts, data.timeRange, data.timeFilter);

		sortPosts(posts, data);

		pids = posts.map(function(post) {
			return post && post.pid;
		});

		callback(null, pids);
	});
}

function getMatchedPosts(pids, data, searchCategories, callback) {
	var postFields = ['pid', 'tid', 'timestamp'];
	var topicFields = [];
	var categoryFields = [];

	if (data.postedBy) {
		postFields.push('uid');
	}

	if (searchCategories.length || (data.sortBy && data.sortBy.startsWith('category.'))) {
		topicFields.push('cid');
	}

	if (data.replies) {
		topicFields.push('postcount');
	}

	if (data.sortBy) {
		if (data.sortBy.startsWith('topic.')) {
			topicFields.push(data.sortBy.split('.')[1]);
		} else if (data.sortBy.startsWith('user.')) {
			postFields.push('uid');
		} else if (data.sortBy.startsWith('category.')) {
			categoryFields.push(data.sortBy.split('.')[1]);
		} else if (data.sortBy.startsWith('teaser')) {
			topicFields.push('teaserPid');
		}
	}

	var posts;
	async.waterfall([
		function(next) {
			var keys = pids.map(function(pid) {
				return 'post:' + pid;
			});
			db.getObjectsFields(keys, postFields, next);
		},
		function(_posts, next) {
			posts = _posts;

			async.parallel({
				users: function(next) {
					if (data.sortBy && data.sortBy.startsWith('user')) {
						var uids = posts.map(function(post) {
							return post.uid;
						});
						user.getMultipleUserFields(uids, ['username'], next);
					} else {
						next();
					}
				},
				topics: function(next) {
					if (!topicFields.length) {
						return next();
					}

					var topics;
					async.waterfall([
						function(next) {
							var topicKeys = posts.map(function(post) {
								return 'topic:' + post.tid;
							});
							db.getObjectsFields(topicKeys, topicFields, next);
						},
						function(_topics, next) {
							topics = _topics;

							async.parallel({
								teasers: function(next) {
									if (topicFields.indexOf('teaserPid') !== -1) {
										var teaserKeys = topics.map(function(topic) {
											return 'post:' + topic.teaserPid;
										});
										db.getObjectsFields(teaserKeys, ['timestamp'], next);
									} else {
										next();
									}
								},
								categories: function(next) {
									if (!categoryFields.length) {
										return next();
									}
									var cids = topics.map(function(topic) {
										return 'category:' + topic.cid;
									});
									db.getObjectsFields(cids, categoryFields, next);
								}
							}, next);
						}
					], function(err, results) {
						if (err) {
							return next(err);
						}

						topics.forEach(function(topic, index) {
							if (topic && results.categories && results.categories[index]) {
								topic.category = results.categories[index];
							}
							if (topic && results.teasers && results.teasers[index]) {
								topic.teaser = results.teasers[index];
							}
						});

						next(null, topics);
					});
				}
			}, next);
		},
		function(results, next) {

			posts.forEach(function(post, index) {
				if (results.topics && results.topics[index]) {
					post.topic = results.topics[index];
					if (results.topics[index].category) {
						post.category = results.topics[index].category;
					}
					if (results.topics[index].teaser) {
						post.teaser = results.topics[index].teaser;
					}
				}

				if (results.users && results.users[index]) {
					post.user = results.users[index];
				}
			});

			next(null, posts);
		}
	], callback);
}

function filterByUser(posts, postedByUid) {
	if (postedByUid) {
		postedByUid = parseInt(postedByUid, 10);
		posts = posts.filter(function(post) {
			return parseInt(post.uid, 10) === postedByUid;
		});
	}
	return posts;
}

function filterByCategories(posts, searchCategories) {
	if (searchCategories.length) {
		posts = posts.filter(function(post) {
			return post.topic && searchCategories.indexOf(post.topic.cid) !== -1;
		});
	}
	return posts;
}

function filterByPostcount(posts, postCount, repliesFilter) {
	postCount = parseInt(postCount, 10);
	if (postCount) {
		if (repliesFilter === 'atleast') {
			posts = posts.filter(function(post) {
				return post.topic && post.topic.postcount >= postCount;
			});
		} else {
			posts = posts.filter(function(post) {
				return post.topic && post.topic.postcount <= postCount;
			});
		}
	}
	return posts;
}

function filterByTimerange(posts, timeRange, timeFilter) {
	timeRange = parseInt(timeRange) * 1000;
	if (timeRange) {
		var time = Date.now() - timeRange;
		if (timeFilter === 'newer') {
			posts = posts.filter(function(post) {
				return post.timestamp >= time;
			});
		} else {
			posts = posts.filter(function(post) {
				return post.timestamp <= time;
			});
		}
	}
	return posts;
}

function sortPosts(posts, data) {
	if (!posts.length) {
		return;
	}
	data.sortBy = data.sortBy || 'timestamp';
	data.sortDirection = data.sortDirection || 'desc';
	if (data.sortBy === 'timestamp') {
		if (data.sortDirection === 'desc') {
			posts.sort(function(p1, p2) {
				return p2.timestamp - p1.timestamp;
			});
		} else {
			posts.sort(function(p1, p2) {
				return p1.timestamp - p2.timestamp;
			});
		}

		return;
	}

	var firstPost = posts[0];
	var fields = data.sortBy.split('.');

	if (!fields || fields.length !== 2 || !firstPost[fields[0]] || !firstPost[fields[0]][fields[1]]) {
		return;
	}

	var value = firstPost[fields[0]][fields[1]];
	var isNumeric = utils.isNumber(value);

	if (isNumeric) {
		if (data.sortDirection === 'desc') {
			sortDescendingNumeric(posts, fields);
		} else {
			sortAscendingNumeric(posts, fields);
		}
	} else {
		if (data.sortDirection === 'desc') {
			sortDescendingAlpha(posts, fields);
		} else {
			sortAscendingAlpha(posts, fields);
		}
	}
}

function sortAscendingNumeric(posts, fields) {
	posts.sort(function(p1, p2) {
		return p1[fields[0]][fields[1]] - p2[fields[0]][fields[1]];
	});
}

function sortDescendingNumeric(posts, fields) {
	posts.sort(function(p1, p2) {
		return p2[fields[0]][fields[1]] - p1[fields[0]][fields[1]];
	});
}

function sortAscendingAlpha(posts, fields) {
	posts.sort(function(p1, p2) {
		if (p1[fields[0]][fields[1]] > p2[fields[0]][fields[1]]) return -1;
		if (p1[fields[0]][fields[1]] < p2[fields[0]][fields[1]]) return 1;
		return 0;
	});
}

function sortDescendingAlpha(posts, fields) {
	posts.sort(function(p1, p2) {
		if (p1[fields[0]][fields[1]] < p2[fields[0]][fields[1]]) return -1;
		if (p1[fields[0]][fields[1]] > p2[fields[0]][fields[1]]) return 1;
		return 0;
	});
}

function getSearchCategories(data, callback) {
	if (!Array.isArray(data.categories) || !data.categories.length || data.categories.indexOf('all') !== -1) {
		return callback(null, []);
	}

	async.parallel({
		watchedCids: function(next) {
			if (data.categories.indexOf('watched') !== -1) {
				user.getWatchedCategories(data.uid, next);
			} else {
				next(null, []);
			}
		},
		childrenCids: function(next) {
			if (data.searchChildren) {
				getChildrenCids(data.categories, data.uid, next);
			} else {
				next(null, []);
			}
		}
	}, function(err, results) {
		if (err) {
			return callback(err);
		}

		var cids = results.watchedCids.concat(results.childrenCids).concat(data.categories).filter(function(cid, index, array) {
			return cid && array.indexOf(cid) === index;
		});

		callback(null, cids);
	});
}

function getChildrenCids(cids, uid, callback) {
	categories.getChildren(cids, uid, function(err, childrenCategories) {
		if (err) {
			return callback(err);
		}

		var childrenCids = [];
		childrenCategories.forEach(function(childrens) {
			childrenCids = childrenCids.concat(childrens.map(function(category) {
				return category && category.cid;
			}));
		});

		callback(null, childrenCids);
	});
}

function searchInUsers(query, uid, callback) {
	user.search({query: query, uid: uid}, function(err, results) {
		if (err) {
			return callback(err);
		}
		callback(null, {matches: results.users, matchCount: results.matchCount});
	});
}

function searchInTags(query, callback) {
	topics.searchAndLoadTags({query: query}, function(err, tags) {
		if (err) {
			return callback(err);
		}

		callback(null, {matches: tags, matchCount: tags.length});
	});
}

function getMainPids(tids, callback) {
	if (!Array.isArray(tids) || !tids.length) {
		return callback(null, []);
	}

	topics.getTopicsFields(tids, ['mainPid'], function(err, topics) {
		if (err) {
			return callback(err);
		}
		topics = topics.map(function(topic) {
			return topic && topic.mainPid;
		}).filter(Boolean);
		callback(null, topics);
	});
}

function searchQuery(index, query, callback) {
	plugins.fireHook('filter:search.query', {
		index: index,
		query: query
	}, callback);
}

