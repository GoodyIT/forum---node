'use strict';
/* globals define, translator, templates */

define(function() {

	var module = {};

	module.alert = function (params) {
		params.alert_id = 'alert_button_' + (params.alert_id ? params.alert_id : new Date().getTime());
		params.title = params.title || '';
		params.location = (params.location || 'right-top');

		var alert = $('#' + params.alert_id);
		if (alert.length) {
			updateAlert(alert, params);
		} else {
			createNew(params);
		}
	};

	function createNew(params) {
		templates.parse('alert', params, function(alertTpl) {
			translator.translate(alertTpl, function(translatedHTML) {
				var alert = $(translatedHTML);
				alert.fadeIn(200);

				$('.alert-' + params.location).prepend(alert);

				if(typeof params.closefn === 'function') {
					alert.find('button').on('click', function() {
						params.closefn();
						fadeOut(alert);
						return false;
					});
				}

				if (params.timeout) {
					startTimeout(alert, params.timeout);
				}

				if (typeof params.clickfn === 'function') {
					alert.on('click', function (e) {
						if(!$(e.target).is('.close')) {
							params.clickfn();
						}
						fadeOut(alert);
					});
				}
			});
		});
	}

	module.remove = function(id) {
		$('#alert_button_' + id).remove();
	};

	function updateAlert(alert, params) {
		alert.find('strong').html(params.title);
		alert.find('p').html(params.message);
		alert.attr('class', 'alert alert-dismissable alert-' + params.type);

		clearTimeout(alert.attr('timeoutId'));
		startTimeout(alert, params.timeout);

		alert.children().fadeOut(100);
		translator.translate(alert.html(), function(translatedHTML) {
			alert.children().fadeIn(100);
			alert.html(translatedHTML);
		});
	}

	function fadeOut(alert) {
		alert.fadeOut(500, function () {
			$(this).remove();
		});
	}

	function startTimeout(alert, timeout) {
		var timeoutId = setTimeout(function () {
			fadeOut(alert);
		}, timeout);

		alert.attr('timeoutId', timeoutId);
	}

	return module;
});
