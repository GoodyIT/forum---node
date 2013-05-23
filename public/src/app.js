var socket,
	config,
	app = {},
	API_URL = null;

// todo: cleanup,etc
(function() {

	$.ajax({
		url: '/config.json?v=' + new Date().getTime(),
		success: function(data) {
			API_URL = data.api_url;

			config = data;
			socket = io.connect('http://' + config.socket.address + config.socket.port? ':' + config.socket.port : '');

			var reconnecting = false;
			var reconnectTries = 0;


			socket.on('event:connect', function(data) {
				console.log('connected to nodebb socket: ', data);
			});

			socket.on('event:alert', function(data) {
				app.alert(data);
			});
			
			socket.on('event:consolelog', function(data) {
				console.log(data);
			});

			socket.on('api:posts.getRawPost', function(data) {
				var contentEl = document.getElementById('post_content');

				contentEl.value = data.post;
			});

			socket.on('connect', function(data){
				if(reconnecting) {
					app.alert({
						alert_id: 'connection_alert',
						title: 'Connected',
						message: 'Connection successfull',
						type: 'success',
						timeout: 5000
					});
					reconnecting = false;
				}
			});

			socket.on('disconnect', function(data){
				app.alert({
					alert_id: 'connection_alert',
					title: 'Disconnect',
					message: 'You have disconnected from NodeBB, we will try to reconnect!',
					type: 'error',
					timeout: 5000
				});
			});

			socket.on('reconnecting', function(data) {
				reconnecting = true;
				reconnectTries++;
				if(reconnectTries > 4) {
					showDisconnectModal();
					return;
				}
				app.alert({
					alert_id: 'connection_alert',
					title: 'Reconnecting',
					message: 'You have disconnected from NodeBB, we will try to reconnect you. <br/><i class="icon-refresh icon-spin"></i>',
					type: 'notify',
					timeout: 5000
				});
			});

			function showDisconnectModal() {
				$('#disconnect-modal').modal({
					backdrop:'static',
					show:true
				});

				$('#reload-button').on('click',function(){
					$('#disconnect-modal').modal('hide');
					window.location.reload();
				});
			}
		},
		async: false
	});

	// takes a string like 1000 and returns 1,000
	app.addCommas = function(text) {
        return text.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

    // Willingly stolen from: http://phpjs.org/functions/strip_tags/
	app.strip_tags = function(input, allowed) {
		allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
		var	tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
			commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

		return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
		});
	}

	// use unique alert_id to have multiple alerts visible at a time, use the same alert_id to fade out the current instance  
	// type : error, success, info, warning/notify
	// title = bolded title text
	// message = alert message content
	// timeout default = permanent
	// location : alert_window (default) or content
	app.alert = function(params) {
		

		var alert_id = 'alert_button_' + ((params.alert_id) ? params.alert_id : new Date().getTime()); 

		var alert = $('#'+alert_id);

		if(alert.length > 0) {
			alert.find('strong').html(params.title);
			alert.find('p').html(params.message);
			alert.attr('class', "alert toaster-alert " + ((params.type=='warning') ? '' : "alert-" + params.type));
		}
		else {

			var div = document.createElement('div'),
				button = document.createElement('button'),
				strong = document.createElement('strong'),
				p = document.createElement('p');

			p.innerHTML = params.message;
			strong.innerHTML = params.title;

			div.className = "alert toaster-alert " + ((params.type=='warning') ? '' : "alert-" + params.type);
			
			div.setAttribute('id', alert_id);
			div.appendChild(button);
			div.appendChild(strong);
			div.appendChild(p);

			button.className = 'close';
			button.innerHTML = '&times;';
			button.onclick = function(ev) {
				div.parentNode.removeChild(div);
			}

			if (params.location == null) 
				params.location = 'alert_window';

			jQuery('#'+params.location).prepend(jQuery(div).fadeIn('100'));

			if (params.timeout) {
				setTimeout(function() {
					jQuery(div).fadeOut(1000, function() {
						this.remove();
					});
				}, params.timeout)
			}

			if (params.clickfn) {
				div.onclick = function() {
					params.clickfn();
					jQuery(div).fadeOut(500, function() {
						this.remove();
					});
				}
			}
		}
	}

	var post_window = null,
		submit_post_btn = null,
		post_title = null,
		reply_title = null,
		post_content = null;


	app.open_post_window = function(post_mode, id, title, pid) {

		submit_post_btn = submit_post_btn || document.getElementById('submit_post_btn');
		post_title = post_title || document.getElementById('post_title');
		reply_title = reply_title || document.getElementById('reply_title');
		post_content = post_content || document.getElementById('post_content');

		post_window = post_window || document.getElementById('post_window');

		jQuery(post_window).slideDown(250);
		$(document.body).addClass('composing');

		if (post_mode == 'topic') {
			post_title.style.display = "block";
			reply_title.style.display = "none";
			post_title.focus();
			submit_post_btn.onclick = function() {
				app.post_topic(id);
			}
		} else if (post_mode === 'edit') {
			reply_title.innerHTML = 'You are editing "' + title + '"';
			socket.emit('api:posts.getRawPost', { pid: pid });

			post_title.style.display = "none";
			reply_title.style.display = "block";
			post_content.focus();
			submit_post_btn.onclick = function() {
				app.edit_post(pid);
			} 
		} else {
			if (post_mode == 'reply') {
				reply_title.innerHTML = 'You are replying to "' + title + '"';
			} else if (post_mode == 'quote') {
				reply_title.innerHTML = 'You are quoting "' + title + '"';
			}

			post_title.style.display = "none";
			reply_title.style.display = "block";
			post_content.focus();
			submit_post_btn.onclick = function() {
				app.post_reply(id)
			} 
		}

		// If there was a saved draft, populate the post content with it now
		if (localStorage) {
			var draft = localStorage.getItem(post_mode + '_' + id + '_draft');
			if (draft && draft.length > 0) {
				post_content.value = draft;
				localStorage.removeItem(post_mode + '_' + id + '_draft');
			}
		}

		// Override post window behaviour if user is not logged in
		if (document.getElementById('user_label') === null) {
			submit_post_btn.innerHTML = '<i class="icon-save"></i> Save &amp; Login</i>';
			submit_post_btn.onclick = function() {
				// Save the post content in localStorage and send the user to registration page
				if (localStorage && post_content.value.length > 0) {
					localStorage.setItem(post_mode + '_' + id + '_draft', post_content.value);

					app.close_post_window();
					post_title.value = '';
					reply_title.value = '';
					post_content.value = '';

					app.alert({
						title: 'Post Saved',
						message: 'We&apos;ve saved your post as a draft. It will be available again when you log in and post again.',
						type: 'notify',
						timeout: 5000
					});

					ajaxify.go('login');
				}
			}
		}
	};

	app.close_post_window = function() {
		post_window = post_window || document.getElementById('post_window');
		jQuery(post_window).slideUp(250);
		$(document.body).removeClass('composing');
	}

	app.post_reply = function(topic_id) {
		var	content = document.getElementById('post_content');

		if (content.length < 5) {
			app.alert({
				title: 'Reply Failure',
				message: 'You need to write more dude.',
				type: 'error',
				timeout: 2000
			});	

			return;
		}

		socket.emit('api:posts.reply', {
			'topic_id' : topic_id,
			'content' : content.value
		});
		app.close_post_window();
		content.value = '';
	};
	app.post_topic = function(category_id) {
		var title = $('#post_title'),
			content = $('#post_content');

		if (title.val().length < 5 || content.val().length < 5) {
			app.alert({
				title: 'Topic Post Failure',
				message: 'You need to write more dude.',
				type: 'error',
				timeout: 2000
			});	

			return;
		}

		socket.emit('api:topics.post', {
			'title' : title.val(),
			'content' : content.val(),
			'category_id' : category_id
		});
		
		app.close_post_window();
		title.val('');
		content.val('');
	};

	app.edit_post = function(pid) {
		var	content = $('#post_content');

		if (content.val().length < 5) {
			app.alert({
				title: 'Topic Post Failure',
				message: 'You need to write more dude.',
				type: 'error',
				timeout: 2000
			});	

			return;
		}

		socket.emit('api:posts.edit', { pid: pid, content: content.val() });

		app.close_post_window();
		content.val('');
	}


	app.current_room = null; 
	app.enter_room = function(room) {
		if (app.current_room === room) return;

		socket.emit('event:enter_room', {
			'enter': room,
			'leave': app.current_room
		});

		app.current_room = room;
	};

	app.process_page = function() {

		function populate_online_users() {
			var uids = [];

			jQuery('.post-row').each(function() {
				uids.push(this.getAttribute('data-uid'));
			});
			
			socket.emit('api:user.get_online_users', uids);
		}


		populate_online_users();

	}

	socket.on('api:user.get_online_users', function(users) {
		jQuery('.username-field').each(function() {
			var uid = jQuery(this).parents('li').attr('data-uid');
			
			if (uid && jQuery.inArray(uid, users) !== -1) {
				jQuery(this).prepend('<i class="icon-circle"></i>');
			} else {
				jQuery(this).prepend('<i class="icon-circle-blank"></i>');
			}
		});
	});

	jQuery('document').ready(function() {
		app.enter_room('global');


		// On menu click, change "active" state
		var menuEl = document.querySelector('.nav'),
			liEls = menuEl.querySelectorAll('li'),
			logoutEl = document.getElementById('logout'),
			parentEl;

		menuEl.addEventListener('click', function(e) {
			parentEl = e.target.parentNode;
			if (parentEl.nodeName === 'LI') {
				for(var x=0,numLis=liEls.length;x<numLis;x++) {
					if (liEls[x] !== parentEl) liEls[x].className = '';
					else parentEl.className = 'active';
				}
			}
		}, false);

		// Posting
		var	formattingBar = document.querySelector('.formatting-bar'),
			postContentEl = document.getElementById('post_content');
		jQuery('#post_window').slideToggle(0);

		if(formattingBar) {

			formattingBar.addEventListener('click', function(e) {
				if (e.target.nodeName === 'I' || e.target.nodeName === 'SPAN') {
					var	cursorEnd = postContentEl.value.length,
						selectionStart = postContentEl.selectionStart,
						selectionEnd = postContentEl.selectionEnd,
						selectionLength = selectionEnd - selectionStart,
						target;
					if (e.target.nodeName === 'I') target = e.target;
					else if (e.target.nodeName === 'SPAN') target = e.target.querySelector('i');
					switch(target.className) {
						case 'icon-bold':
							if (selectionStart === selectionEnd) {
								// Nothing selected
								postContentEl.value = postContentEl.value + '**bolded text**';
								postContentEl.selectionStart = cursorEnd+2;
								postContentEl.selectionEnd = postContentEl.value.length - 2;
							} else {
								// Text selected
								postContentEl.value = postContentEl.value.slice(0, selectionStart) + '**' + postContentEl.value.slice(selectionStart, selectionEnd) + '**' + postContentEl.value.slice(selectionEnd);
								postContentEl.selectionStart = selectionStart + 2;
								postContentEl.selectionEnd = selectionEnd + 2;
							}
						break;
						case 'icon-italic':
							if (selectionStart === selectionEnd) {
								// Nothing selected
								postContentEl.value = postContentEl.value + '*italicised text*';
								postContentEl.selectionStart = cursorEnd+1;
								postContentEl.selectionEnd = postContentEl.value.length - 1;
							} else {
								// Text selected
								postContentEl.value = postContentEl.value.slice(0, selectionStart) + '*' + postContentEl.value.slice(selectionStart, selectionEnd) + '*' + postContentEl.value.slice(selectionEnd);
								postContentEl.selectionStart = selectionStart + 1;
								postContentEl.selectionEnd = selectionEnd + 1;
							}
						break;
						case 'icon-list':
							// Nothing selected
							postContentEl.value = postContentEl.value + "\n\n* list item";
							postContentEl.selectionStart = cursorEnd+4;
							postContentEl.selectionEnd = postContentEl.value.length;
						break;
						case 'icon-link':
							if (selectionStart === selectionEnd) {
								// Nothing selected
								postContentEl.value = postContentEl.value + '[link text](link url)';
								postContentEl.selectionStart = cursorEnd+12;
								postContentEl.selectionEnd = postContentEl.value.length - 1;
							} else {
								// Text selected
								postContentEl.value = postContentEl.value.slice(0, selectionStart) + '[' + postContentEl.value.slice(selectionStart, selectionEnd) + '](link url)' + postContentEl.value.slice(selectionEnd);
								postContentEl.selectionStart = selectionStart + selectionLength + 3;
								postContentEl.selectionEnd = selectionEnd + 11;
							}
						break;
					}
				}
			}, false);
		}
	});



}());
