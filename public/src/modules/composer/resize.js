
'use strict';

/* globals app, define, config, utils*/

define('composer/resize', function() {
	var resize = {},
		oldPercentage = 0,
		env;

	resize.reposition = function(postContainer) {
		var	percentage = localStorage.getItem('composer:resizePercentage');

		doResize(postContainer, percentage);
	};

	function doResize(postContainer, percentage) {
		if (!env) {
			env = utils.findBootstrapEnvironment();
		}

		if (percentage) {
			if (env === 'md' || env === 'lg') {
				postContainer.height(Math.floor($(window).height() * percentage) - 1 + 'px');
			}
		}

		if (env === 'sm' || env === 'xs' || window.innerHeight < 480) {
			app.toggleNavbar(false);
			postContainer.css('height', $(window).height());
		}

		if (config.hasImageUploadPlugin) {
			postContainer.find('.img-upload-btn').removeClass('hide');
			postContainer.find('#files.lt-ie9').removeClass('hide');
		}

		if (config.allowFileUploads) {
			postContainer.find('.file-upload-btn').removeClass('hide');
			postContainer.find('#files.lt-ie9').removeClass('hide');
		}

		postContainer.css('visibility', 'visible');

		// Add some extra space at the bottom of the body so that the user can still scroll to the last post w/ composer open
		$('body').css({'margin-bottom': postContainer.css('height')});

		resizeWritePreview(postContainer);
	}

	resize.handleResize = function(postContainer) {
		function resizeStart(e) {
			var resizeRect = resizeEl[0].getBoundingClientRect();
			var resizeCenterY = resizeRect.top + (resizeRect.height/2);
			resizeOffset = resizeCenterY - e.clientY;
			resizeActive = true;
			resizeDown = e.clientY;

			$(window).on('mousemove', resizeAction);
			$(window).on('mouseup', resizeStop);
			$('body').on('touchmove', resizeTouchAction);
		}

		function resizeStop(e) {
			resizeActive = false;
			toggleHeight(e);

			postContainer.find('textarea').focus();
			$(window).off('mousemove', resizeAction);
			$(window).off('mouseup', resizeStop);
			$('body').off('touchmove', resizeTouchAction);
		}

		function toggleHeight(e) {
			var composer = $('.composer');
			if (e.clientY - resizeDown === 0){
				var newPercentage = ($(window).height() - $('#header-menu').height() - 20) / $(window).height();

				if (!composer.hasClass('maximized')) {
					oldPercentage = getPercentage(postContainer);
					doResize(postContainer, newPercentage);
					composer.addClass('maximized');
				} else {
					doResize(postContainer, oldPercentage);
					composer.removeClass('maximized');
				}
			} else {
				composer.removeClass('maximized');
			}
		}

		function resizeTouchAction(e) {
			e.preventDefault();
			resizeAction(e.touches[0]);
		}

		function resizeAction(e) {
			if (resizeActive) {
				var position = (e.clientY + resizeOffset);
				var newHeight = $(window).height() - position;

				if(newHeight > $(window).height() - $('#header-menu').height() - 20) {
					newHeight = $(window).height() - $('#header-menu').height() - 20;
				} else if (newHeight < 100) {
					newHeight = 100;
				}

				postContainer.css('height', newHeight);
				$('body').css({'margin-bottom': newHeight});
				resizeWritePreview(postContainer);
				resizeSavePosition(newHeight);
			}
			e.preventDefault();
			return false;
		}

		function resizeSavePosition(px) {
			var	percentage = px / $(window).height();
			localStorage.setItem('composer:resizePercentage', percentage);
		}

		function getPercentage(postContainer) {
			return postContainer.height() / $(window).height();
		}

		var	resizeActive = false,
			resizeOffset = 0,
            resizeDown = 0,
			resizeEl = postContainer.find('.resizer');

		resizeEl.on('mousedown', resizeStart);

		resizeEl.on('touchstart', function(e) {
			e.preventDefault();
			resizeStart(e.touches[0]);
		});

		resizeEl.on('touchend', function(e) {
			e.preventDefault();
			resizeStop();
		});
	};


	function resizeWritePreview(postContainer) {
		var rows = [
			postContainer.find('.title-container').outerHeight(true),
			postContainer.find('.formatting-bar').outerHeight(true),
			postContainer.find('.topic-thumb-container').outerHeight(true),
			$('.taskbar').height()
		];

		var total = rows.reduce(function(a, b) {
			return a + b;
		});
		
		postContainer.find('.write-preview-container').css('height', postContainer.height() - total);
	}


	return resize;
});
