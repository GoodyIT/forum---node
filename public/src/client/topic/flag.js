'use strict';



define('forum/topic/flag', [], function () {

	var Flag = {};
	var flagModal;
	var flagCommit;

	Flag.showFlagModal = function (pid, username, userslug) {
		parseModal({
			pid: pid,
			username: username,
			userslug: userslug,
		}, function (html) {
			flagModal = $(html);

			flagModal.on('hidden.bs.modal', function () {
				flagModal.remove();
			});

			flagCommit = flagModal.find('#flag-post-commit');

			flagModal.on('click', '.flag-reason', function () {
				flagPost(pid, $(this).text());
			});

			flagCommit.on('click', function () {
				flagPost(pid, flagModal.find('#flag-reason-custom').val());
			});

			flagModal.modal('show');

			flagModal.find('#flag-reason-custom').on('keyup blur change', checkFlagButtonEnable);
		});
	};

	function parseModal(tplData, callback) {
		templates.parse('partials/modals/flag_post_modal', tplData, function (html) {
			require(['translator'], function (translator) {
				translator.translate(html, callback);
			});
		});
	}

	function flagPost(pid, reason) {
		if (!pid || !reason) {
			return;
		}
		socket.emit('posts.flag', {pid: pid, reason: reason}, function (err) {
			if (err) {
				return app.alertError(err.message);
			}

			flagModal.modal('hide');
			app.alertSuccess('[[topic:flag_success]]');
		});
	}

	function checkFlagButtonEnable() {
		if (flagModal.find('#flag-reason-custom').val()) {
			flagCommit.removeAttr('disabled');
		} else {
			flagCommit.attr('disabled', true);
		}
	}

	return Flag;
});
