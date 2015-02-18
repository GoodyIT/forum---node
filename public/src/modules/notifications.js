'use strict';

/* globals define, socket, translator, utils, config, app, ajaxify, Tinycon*/

define('notifications', ['sounds'], function(sound) {
	var Notifications = {};

	Notifications.prepareDOM = function() {
		var notifContainer = $('.notifications'),
			notifTrigger = notifContainer.children('a'),
			notifList = $('#notif-list'),
			notifIcon = $('.notification-icon');

		notifTrigger.on('click', function(e) {
			e.preventDefault();
			if (notifContainer.hasClass('open')) {
				return;
			}

			socket.emit('notifications.get', null, function(err, data) {
				if (err) {
					return app.alertError(err.message);
				}

				var notifs = data.unread.concat(data.read);

				translator.toggleTimeagoShorthand();
				for(var i=0; i<notifs.length; ++i) {
					notifs[i].timeago = $.timeago(new Date(parseInt(notifs[i].datetime, 10)));
				}
				translator.toggleTimeagoShorthand();

				templates.parse('partials/notifications_list', {notifications: notifs}, function(html) {
					notifList.translateHtml(html);
				});
			});
		});

		notifList.on('click', '[data-nid]', function() {
			var nid = $(this).attr('data-nid');
			socket.emit('notifications.markRead', nid, function(err) {
				if (err) {
					app.alertError(err.message);
				}
			});
		});

		notifList.on('click', '.mark-all-read', function() {
			socket.emit('notifications.markAllRead', function(err) {
				if (err) {
					app.alertError(err.message);
				}
				updateNotifCount(0);
			});
		});

		function updateNotifCount(count) {
			if (count > 0) {
				notifIcon.removeClass('fa-bell-o').addClass('fa-bell');
			} else {
				notifIcon.removeClass('fa-bell').addClass('fa-bell-o');
			}

			notifIcon.toggleClass('unread-count', count > 0);
			notifIcon.attr('data-content', count > 20 ? '20+' : count);

			Tinycon.setBubble(count);
		};

		function increaseNotifCount() {
			var count = parseInt(notifIcon.attr('data-content'), 10) + 1;
			updateNotifCount(count);
		}

		socket.emit('notifications.getCount', function(err, count) {
			if (!err) {
				updateNotifCount(count);
			} else {
				updateNotifCount(0);
			}
		});

		socket.on('event:new_notification', function(notifData) {
			app.alert({
				alert_id: 'new_notif',
				title: '[[notifications:new_notification]]',
				message: '[[notifications:you_have_unread_notifications]]',
				type: 'warning',
				timeout: 2000
			});
			app.refreshTitle();

			if (ajaxify.currentPage === 'notifications') {
				ajaxify.refresh();
			}

			increaseNotifCount();

			sound.play('notification');
		});

		socket.on('event:notifications.updateCount', function(count) {
			updateNotifCount(count);
		});
	};

	return Notifications;
});
