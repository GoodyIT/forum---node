<div class="container">
	<ul class="breadcrumb">
		<li><a href="/">Home</a><span class="divider">/</span></li>
		<li><a href="/category/{category_slug}">{category_name}</a><span class="divider">/</span></li>
		<li class="active">{topic_name}</li>
		<div id="thread_active_users" class="hidden-phone"></div>
	</ul>
</div>

<ul id="post-container" class="post-container container">
	


	<!-- BEGIN main_posts -->
		<li class="row post-row main-post" data-pid="{main_posts.pid}" data-uid="{main_posts.uid}" data-deleted="{main_posts.deleted}">
			<div class="span12">
				<div class="post-block">
					<a class="main-avatar" href="/users/{main_posts.username}">
						<img src="{main_posts.gravatar}?s=80" align="left" /><br />
						<div class="hover-overlay">
							{main_posts.username}<br />
							<i class="icon-star"></i><span class="user_rep_{main_posts.uid}">{main_posts.user_rep}</span>
							<i class="icon-pencil"></i><span class="user_posts_{main_posts.uid}">8</span>
						</div>
					</a>
					<h3><p class="topic-title">{topic_name}</p> 
						<div class="pull-right hidden-phone" style="margin-right: 10px;">
							<button id="ids_{main_posts.pid}_{main_posts.uid}" class="btn edit {main_posts.display_moderator_tools}" type="button"><i class="icon-pencil"></i></button>
							<button id="ids_{main_posts.pid}_{main_posts.uid}" class="btn delete {main_posts.display_moderator_tools}" type="button"><i class="icon-trash"></i></button>
							<button id="quote_{main_posts.pid}_{main_posts.uid}" class="btn quote" type="button"><i class="icon-quote-left"></i></button>

							<button id="favs_{main_posts.pid}_{main_posts.uid}" class="favourite btn" type="button"><span class="post_rep_{main_posts.pid}">Favourite {main_posts.post_rep} </span><i class="{main_posts.fav_star_class}"></i></button>
							<button id="post_reply" class="btn btn-primary btn post_reply" type="button">Reply <i class="icon-reply"></i></button>
						</div>
					</h3>


					<hr />
					<small>
						posted {main_posts.relativeTime} ago by <strong><a href="/users/{main_posts.username}" class="username-field">{main_posts.username}</a></strong>
						<span class="{main_posts.edited-class}"><i class="icon-edit" title="edited by {main_posts.editor} {main_posts.relativeEditTime} ago"></i></span>
					</small>

					<div style="clear:both; margin-bottom: 10px;"></div>

					<div id="content_{main_posts.pid}" class="post-content">{main_posts.content}</div>
					<div class="post-signature">{main_posts.signature}</div>
					<div class="profile-block"></div>
				</div>
			</div>
		</li>
	<!-- END main_posts -->

	<!-- BEGIN posts -->
		<li class="row post-row" data-pid="{posts.pid}" data-uid="{posts.uid}" data-username="{posts.username}" data-deleted="{posts.deleted}">
			<div class="span1 profile-image-block visible-desktop">
				<!--<i class="icon-spinner icon-spin icon-2x pull-left"></i>-->
				<a href="/users/{posts.username}">
					<img src="{posts.gravatar}?s=80" align="left" />
				</a>
				<i class="icon-star"></i><span class="user_rep_{posts.uid} formatted-number">{posts.user_rep}</span>
			</div>
			<div class="span11">
				<div class="post-block">
					<div id="content_{posts.pid}" class="post-content">{posts.content}</div>
					<div class="post-signature">{posts.signature}</div>
					<div class="profile-block">
						<span class="post-buttons">
							<div id="ids_{posts.pid}_{posts.uid}" class="chat hidden-phone"><i class="icon-comment"></i></div>
							<div id="ids_{posts.pid}_{posts.uid}" class="edit {posts.display_moderator_tools} hidden-phone"><i class="icon-pencil"></i></div>
							<div id="ids_{posts.pid}_{posts.uid}" class="delete {posts.display_moderator_tools} hidden-phone"><i class="icon-trash"></i></div>
							<div id="quote_{posts.pid}_{posts.uid}" class="quote hidden-phone"><i class="icon-quote-left"></i></div>
							<div id="favs_{posts.pid}_{posts.uid}" class="favourite hidden-phone"><span class="post_rep_{posts.pid}">{posts.post_rep}</span><i class="{posts.fav_star_class}"></i></div>
							<div class="post_reply"><i class="icon-reply"></i></div>
						</span>
						<img class="hidden-desktop" src="{posts.gravatar}?s=10" align="left" /> posted by <strong><a class="username-field" href="/users/{posts.username}">{posts.username}</a></strong> {posts.relativeTime} ago
						<span class="{posts.edited-class} hidden-phone">| last edited by <strong><a href="/users/{posts.editor}">{posts.editor}</a></strong> {posts.relativeEditTime} ago</span>
						<span class="{posts.edited-class}"><i class="icon-edit visible-phone" title="edited by {posts.editor} {posts.relativeEditTime} ago"></i></span>
					</div>
				</div>
			</div>
		</li>
	<!-- END posts -->
</ul>
<hr />
<button id="post_reply" class="btn btn-primary btn-large post_reply" type="button">Reply</button>
<div class="btn-group pull-right" id="thread-tools" style="visibility: hidden;">
	<button class="btn dropdown-toggle" data-toggle="dropdown" type="button">Thread Tools <span class="caret"></span></button>
	<ul class="dropdown-menu">
		<li><a href="#" id="pin_thread"><i class="icon-pushpin"></i> Pin Thread</a></li>
		<li><a href="#" id="lock_thread"><i class="icon-lock"></i> Lock Thread</a></li>
		<li class="divider"></li>
		<li><a href="#" id="move_thread"><i class="icon-move"></i> Move Thread</a></li>
		<li class="divider"></li>
		<li><a href="#" id="delete_thread"><span class="text-error"><i class="icon-trash"></i> Delete Thread</span></a></li>
	</ul>
</div>
<div id="move_thread_modal" class="modal hide fade">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3>Move Thread</h3>
	</div>
	<div class="modal-body">
		<p id="categories-loading"><i class="icon-spin icon-refresh"></i> Loading Categories</p>
		<ul class="category-list"></ul>
		<div id="move-confirm" style="display: none;">
			<hr />
			<div class="alert">This topic will be moved to the category <strong><span id="confirm-category-name"></span></strong></div>
		</div>
	</div>
	<div class="modal-footer">
		<button type="button" class="btn" data-dismiss="modal" id="move_thread_cancel">Close</a>
		<button type="button" class="btn btn-primary" id="move_thread_commit" disabled>Move</a>
	</div>
</div>


<script type="text/javascript">
	(function() {
		var	expose_tools = '{expose_tools}',
			tid = '{topic_id}',
			postListEl = document.getElementById('post-container'),
			editBtns = document.querySelectorAll('#post-container .post-buttons .edit, #post-container .post-buttons .edit i'),
			thread_state = {
				locked: '{locked}',
				deleted: '{deleted}',
				pinned: '{pinned}'
			};

		function addCommasToNumbers() {
			$('.formatted-number').each(function(index, element) {
	        	$(element).html(app.addCommas($(element).html()));
        	});
		}

		jQuery('document').ready(function() {

			addCommasToNumbers();
			
			var	room = 'topic_' + '{topic_id}',
				adminTools = document.getElementById('thread-tools');

			app.enter_room(room);
			set_up_posts();

			if (thread_state.locked === '1') set_locked_state(true);
			if (thread_state.deleted === '1') set_delete_state(true);
			if (thread_state.pinned === '1') set_pinned_state(true);

			if (expose_tools === '1') {
				var deleteThreadEl = document.getElementById('delete_thread'),
					lockThreadEl = document.getElementById('lock_thread'),
					pinThreadEl = document.getElementById('pin_thread'),
					moveThreadEl = document.getElementById('move_thread'),
					moveThreadModal = $('#move_thread_modal');

				adminTools.style.visibility = 'inherit';

				// Add events to the thread tools
				deleteThreadEl.addEventListener('click', function(e) {
					e.preventDefault();
					if (thread_state.deleted !== '1') {
						if (confirm('really delete thread? (THIS DIALOG TO BE REPLACED WITH BOOTBOX)')) {
							socket.emit('api:topic.delete', { tid: tid });
						}
					} else {
						if (confirm('really restore thread? (THIS DIALOG TO BE REPLACED WITH BOOTBOX)')) {
							socket.emit('api:topic.restore', { tid: tid });
						}
					}
				}, false);

				lockThreadEl.addEventListener('click', function(e) {
					e.preventDefault();
					if (thread_state.locked !== '1') {
						socket.emit('api:topic.lock', { tid: tid });
					} else {
						socket.emit('api:topic.unlock', { tid: tid });
					}
				}, false);

				pinThreadEl.addEventListener('click', function(e) {
					e.preventDefault();
					if (thread_state.pinned !== '1') {
						socket.emit('api:topic.pin', { tid: tid });
					} else {
						socket.emit('api:topic.unpin', { tid: tid });
					}
				}, false);

				moveThreadEl.addEventListener('click', function(e) {
					e.preventDefault();
					moveThreadModal.modal('show');
				}, false);

				moveThreadModal.on('shown', function() {
					var loadingEl = document.getElementById('categories-loading');
					if (loadingEl) {
						socket.once('api:categories.get', function(data) {
							// Render categories
							var	categoriesFrag = document.createDocumentFragment(),
								categoryEl = document.createElement('li'),
								numCategories = data.categories.length,
								modalBody = moveThreadModal.find('.modal-body'),
								categoriesEl = modalBody[0].getElementsByTagName('ul')[0],
								confirmDiv = document.getElementById('move-confirm'),
								confirmCat = confirmDiv.getElementsByTagName('span')[0],
								commitEl = document.getElementById('move_thread_commit'),
								cancelEl = document.getElementById('move_thread_cancel'),
								x, info, targetCid, targetCatLabel;

							categoriesEl.className = 'category-list';
							for(x=0;x<numCategories;x++) {
								info = data.categories[x];
								categoryEl.className = info.blockclass;
								categoryEl.innerHTML = '<i class="' + info.icon + '"></i> ' + info.name;
								categoryEl.setAttribute('data-cid', info.cid);
								categoriesFrag.appendChild(categoryEl.cloneNode(true));
							}
							categoriesEl.appendChild(categoriesFrag);
							modalBody[0].removeChild(loadingEl);

							categoriesEl.addEventListener('click', function(e) {
								if (e.target.nodeName === 'LI') {
									confirmCat.innerHTML = e.target.innerHTML;
									confirmDiv.style.display = 'block';
									targetCid = e.target.getAttribute('data-cid');
									targetCatLabel = e.target.innerHTML;
									commitEl.disabled = false;
								}
							}, false);

							commitEl.addEventListener('click', function() {
								if (!commitEl.disabled && targetCid) {
									commitEl.disabled = true;
									$(cancelEl).fadeOut(250);
									$(moveThreadModal).find('.modal-header button').fadeOut(250);
									commitEl.innerHTML = 'Moving <i class="icon-spin icon-refresh"></i>';

									socket.once('api:topic.move', function(data) {
										moveThreadModal.modal('hide');
										if (data.status === 'ok') {
											app.alert({
												'alert_id': 'thread_move',
												type: 'success',
												title: 'Topic Successfully Moved',
												message: 'This topic has been successfully moved to ' + targetCatLabel,
												timeout: 5000
											});
										} else {
											app.alert({
												'alert_id': 'thread_move',
												type: 'error',
												title: 'Unable to Move Topic',
												message: 'This topic could not be moved to ' + targetCatLabel + '.<br />Please try again later',
												timeout: 5000
											});
										}
									});
									socket.emit('api:topic.move', { tid: tid, cid: targetCid });
								}
							});
						});
						socket.emit('api:categories.get');
					}
				});
			}

			// Fix delete state for this thread's posts
			var	postEls = document.querySelectorAll('#post-container li[data-deleted]');
			for(var x=0,numPosts=postEls.length;x<numPosts;x++) {
				if (postEls[x].getAttribute('data-deleted') === '1') toggle_post_delete_state(postEls[x].getAttribute('data-pid'));
				postEls[x].removeAttribute('data-deleted');
			}
		});


		$('.post-container').delegate('.edit', 'click', function(e) {
			var pid = ($(this).attr('id') || $(this.parentNode).attr('id')).split('_')[1];
			app.open_post_window('edit', "{topic_id}", "{topic_name}", pid);
		});

		$('.post-container').delegate('.delete', 'click', function(e) {
			var	pid = ($(this).attr('id') || $(this.parentNode).attr('id')).split('_')[1],
			postEl = $(document.querySelector('#post-container li[data-pid="' + pid + '"]')),
			deleteAction = !postEl.hasClass('deleted') ? true : false,
			confirmDel = confirm((deleteAction ? 'Delete' : 'Restore') + ' this post?');

			if (confirmDel) {
				deleteAction ?
				socket.emit('api:posts.delete', { pid: pid }) :
				socket.emit('api:posts.restore', { pid: pid });
			}
		}); 

		// CHAT, move to chat.js later?

		$('.post-container').delegate('.chat', 'click', function(e){

			var username = $(this).parents('li').attr('data-username');
			var touid = $(this).parents('li').attr('data-uid');

			var chatModal = createModalIfDoesntExist(username, touid);

			chatModal.show();
			bringModalToTop(chatModal);
			
		});

		function bringModalToTop(chatModal) {
			var topZ = 0;
			$('.modal').each(function(){
			  var thisZ = parseInt($(this).css('zIndex'), 10);
			  if (thisZ > topZ){
			    topZ = thisZ;
			  }
			});
			chatModal.css('zIndex', topZ+1);
		}

		function createModalIfDoesntExist(username, touid) {
			var chatModal = $('#chat-modal-'+touid);

			if(!chatModal.length) {
				var chatModal = $('#chat-modal').clone();
				chatModal.attr('id','chat-modal-'+touid);
				chatModal.appendTo($('body'));
				chatModal.draggable();
				chatModal.find('#chat-with-name').html(username);

				chatModal.find('.close').on('click',function(e){
					chatModal.hide();
				});

				chatModal.on('click', function(e){
					bringModalToTop(chatModal);
				});

				addSendHandler(chatModal, touid);	
			}

			return chatModal;
		}

		function addSendHandler(chatModal, touid) {
			chatModal.find('#chat-message-input').off('keypress');
			chatModal.find('#chat-message-input').on('keypress', function(e) {
				if(e.which === 13) {
					sendMessage(chatModal, touid);
				}
			});

			chatModal.find('#chat-message-send-btn').off('click');
			chatModal.find('#chat-message-send-btn').on('click', function(e){
				sendMessage(chatModal, touid);
				return false;
			});
		}

		function sendMessage(chatModal, touid) {
			var msg = app.strip_tags(chatModal.find('#chat-message-input').val()) + '\n';
			socket.emit('sendChatMessage', { touid:touid, message:msg});
			chatModal.find('#chat-message-input').val('');
			appendChatMessage(chatModal, 'You : ' + msg);
		}

		socket.on('chatMessage', function(data){
			var username = data.username;
			var fromuid = data.fromuid;
			var message = data.message;

			var chatModal = createModalIfDoesntExist(username, fromuid);
			chatModal.show();
			bringModalToTop(chatModal);
		
			appendChatMessage(chatModal, message)
		});

		function appendChatMessage(chatModal, message){
			var chatContent = chatModal.find('#chat-content');
			chatContent.append(message);
    		chatContent.scrollTop(
        		chatContent[0].scrollHeight - chatContent.height()
    		);
		}
		//end of chat


		ajaxify.register_events([
			'event:rep_up', 'event:rep_down', 'event:new_post', 'api:get_users_in_room',
			'event:topic_deleted', 'event:topic_restored', 'event:topic:locked',
			'event:topic_unlocked', 'event:topic_pinned', 'event:topic_unpinned',
			'event:topic_moved', 'event:post_edited', 'event:post_deleted', 'event:post_restored',
			'api:posts.favourite'
		]);


		socket.on('api:get_users_in_room', function(users) {
			var anonymous = users.anonymous,
				usernames = users.usernames,
				usercount = usernames.length;

			for (var i = 0, ii=usercount; i<ii; i++) {
				usernames[i] = '<strong>' + '<a href="/users/'+usernames[i]+'">' + usernames[i] + '</a></strong>';
			}

			// headexplosion.gif for fun, to see if I could do this in one line of code. feel free to refactor haha
			var active =
				((usercount === 1) ? usernames[0] : '')
				+ ((usercount === 2 && anonymous === 0) ? usernames[0] + ' and ' + usernames[1] : '')
				+ ((usercount > 2 && anonymous === 0) ? usernames.join(', ').replace(/,([^,]*)$/, ", and$1") : '')
				+ (usercount > 1 && anonymous > 0 ? usernames.join(', ') : '')
				+ ((anonymous > 0) ? (usercount > 0 ? ' and ': '') + anonymous + ' guest' + (anonymous > 1  ? 's are': ' is') : '')
				+ (anonymous === 0 ? (usercount > 1 ? ' are' : ' is') : '') + ' browsing this thread';

			document.getElementById('thread_active_users').innerHTML = active;
		});

		socket.on('event:rep_up', function(data) {
			adjust_rep(1, data.pid, data.uid);
		});

		socket.on('event:rep_down', function(data) {
			adjust_rep(-1, data.pid, data.uid);
		});

		socket.on('event:new_post', function(data) {
			var html = templates.prepare(templates['topic'].blocks['posts']).parse(data),
				uniqueid = new Date().getTime();
				
			jQuery('<div id="' + uniqueid + '"></div>')
				.appendTo("#post-container")
				.hide()
				.append(html)
				.fadeIn('slow');

			set_up_posts(uniqueid);
			
			addCommasToNumbers();
		});

		socket.on('event:topic_deleted', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_locked_state(true);
				set_delete_state(true);
			}
		});

		socket.on('event:topic_restored', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_locked_state(false);
				set_delete_state(false);
			}
		});

		socket.on('event:topic_locked', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_locked_state(true, 1);
			}
		});

		socket.on('event:topic_unlocked', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_locked_state(false, 1);
			}
		});

		socket.on('event:topic_pinned', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_pinned_state(true, 1);
			}
		});

		socket.on('event:topic_unpinned', function(data) {
			if (data.tid === tid && data.status === 'ok') {
				set_pinned_state(false, 1);
			}
		});

		socket.on('event:topic_moved', function(data) {
			if (data && data.tid > 0) ajaxify.go('topic/' + data.tid);
		});

		socket.on('event:post_edited', function(data) {
			var editedPostEl = document.getElementById('content_' + data.pid);
			$(editedPostEl).fadeOut(250, function() {
				this.innerHTML = data.content;
				$(this).fadeIn(250);
			});
		});

		socket.on('api:posts.favourite', function(data) {
			if (data.status !== 'ok' && data.pid) {
				var favEl = document.querySelector('.post_rep_' + data.pid).nextSibling;
				if (favEl) favEl.className = 'icon-star-empty';
			}
		});

		socket.on('event:post_deleted', function(data) {
			if (data.pid) toggle_post_delete_state(data.pid, true);
		});

		socket.on('event:post_restored', function(data) {
			if (data.pid) toggle_post_delete_state(data.pid, true);
		});

		function adjust_rep(value, pid, uid) {
			var post_rep = jQuery('.post_rep_' + pid),
				user_rep = jQuery('.user_rep_' + uid);

			var ptotal = parseInt(post_rep.html(), 10),
				utotal = parseInt(user_rep.html(), 10);

			ptotal += value;
			utotal += value;

			post_rep.html(ptotal);
			user_rep.html(utotal);
		}


		function set_up_posts(div) {
			if (div == null) div = '';
			else div = '#' + div;

			jQuery(div + ' .post_reply').click(function() {
				if (thread_state.locked !== '1') app.open_post_window('reply', "{topic_id}", "{topic_name}");
			});

			jQuery(div + ' .quote').click(function() {
				if (thread_state.locked !== '1') app.open_post_window('quote', "{topic_id}", "{topic_name}");
				
				var pid = $(this).parents('li').attr('data-pid');
				
				$('#post_content').val('> ' + $('#content_' + pid).html() + '\n');
				console.log("POST ID "+pid);
			});

			jQuery(div + ' .edit, ' + div + ' .delete').each(function() {
				var ids = this.id.replace('ids_', '').split('_'),
					pid = ids[0],
					uid = ids[1];

			});

			jQuery(div + ' .favourite').click(function() {
				var ids = this.id.replace('favs_', '').split('_'),
					pid = ids[0],
					uid = ids[1];

				if (thread_state.locked !== '1') {
					if (this.children[1].className == 'icon-star-empty') {
						this.children[1].className = 'icon-star';
						socket.emit('api:posts.favourite', {pid: pid, room_id: app.current_room});
					}
					else {
						this.children[1].className = 'icon-star-empty';
						socket.emit('api:posts.unfavourite', {pid: pid, room_id: app.current_room});
					}
				}
			});
		}

		function set_locked_state(locked, alert) {
			var	threadReplyBtn = document.getElementById('post_reply'),
				postReplyBtns = document.querySelectorAll('#post-container .post_reply'),
				quoteBtns = document.querySelectorAll('#post-container .quote'),
				editBtns = document.querySelectorAll('#post-container .edit'),
				deleteBtns = document.querySelectorAll('#post-container .delete'),
				numReplyBtns = postReplyBtns.length,
				lockThreadEl = document.getElementById('lock_thread'),
				x;

			if (locked === true) {
				lockThreadEl.innerHTML = '<i class="icon-unlock"></i> Unlock Thread';
				threadReplyBtn.disabled = true;
				threadReplyBtn.innerHTML = 'Locked <i class="icon-lock"></i>';
				for(x=0;x<numReplyBtns;x++) {
					postReplyBtns[x].innerHTML = 'Locked <i class="icon-lock"></i>';
					quoteBtns[x].style.display = 'none';
					editBtns[x].style.display = 'none';
					deleteBtns[x].style.display = 'none';
				}

				if (alert) {
					app.alert({
						'alert_id': 'thread_lock',
						type: 'success',
						title: 'Thread Locked',
						message: 'Thread has been successfully locked',
						timeout: 5000
					});
				}

				thread_state.locked = '1';
			} else {
				lockThreadEl.innerHTML = '<i class="icon-lock"></i> Lock Thread';
				threadReplyBtn.disabled = false;
				threadReplyBtn.innerHTML = 'Reply';
				for(x=0;x<numReplyBtns;x++) {
					postReplyBtns[x].innerHTML = 'Reply <i class="icon-reply"></i>';
					quoteBtns[x].style.display = 'inline-block';
					editBtns[x].style.display = 'inline-block';
					deleteBtns[x].style.display = 'inline-block';
				}

				if (alert) {
					app.alert({
						'alert_id': 'thread_lock',
						type: 'success',
						title: 'Thread Unlocked',
						message: 'Thread has been successfully unlocked',
						timeout: 5000
					});
				}

				thread_state.locked = '0';
			}
		}

		function set_delete_state(deleted) {
			var	deleteThreadEl = document.getElementById('delete_thread'),
				deleteTextEl = deleteThreadEl.getElementsByTagName('span')[0],
				threadEl = document.querySelector('.post-container'),
				deleteNotice = document.getElementById('thread-deleted') || document.createElement('div');

			if (deleted) {
				deleteTextEl.innerHTML = '<i class="icon-comment"></i> Restore Thread';
				$(threadEl).addClass('deleted');

				// Spawn a 'deleted' notice at the top of the page
				deleteNotice.setAttribute('id', 'thread-deleted');
				deleteNotice.className = 'alert';
				deleteNotice.innerHTML = 'This thread has been deleted. Only users with thread management privileges can see it.';
				document.getElementById('content').insertBefore(deleteNotice, threadEl);

				thread_state.deleted = '1';
			} else {
				deleteTextEl.innerHTML = '<i class="icon-trash"></i> Delete Thread';
				$(threadEl).removeClass('deleted');
				deleteNotice.parentNode.removeChild(deleteNotice);

				thread_state.deleted = '0';
			}
		}

		function set_pinned_state(pinned, alert) {
			var pinEl = document.getElementById('pin_thread');

			if (pinned) {
				pinEl.innerHTML = '<i class="icon-pushpin"></i> Unpin Thread';
				if (alert) {
					app.alert({
						'alert_id': 'thread_pin',
						type: 'success',
						title: 'Thread Pinned',
						message: 'Thread has been successfully pinned',
						timeout: 5000
					});
				}

				thread_state.pinned = '1';
			} else {
				pinEl.innerHTML = '<i class="icon-pushpin"></i> Pin Thread';
				if (alert) {
					app.alert({
						'alert_id': 'thread_pin',
						type: 'success',
						title: 'Thread Unpinned',
						message: 'Thread has been successfully unpinned',
						timeout: 5000
					});
				}

				thread_state.pinned = '0';
			}
		}

		function toggle_post_delete_state(pid) {
			var postEl = $(document.querySelector('#post-container li[data-pid="' + pid + '"]'));
				quoteEl = $(postEl[0].querySelector('.quote')),
				favEl = $(postEl[0].querySelector('.favourite')),
				replyEl = $(postEl[0].querySelector('.post_reply'));

			if (!postEl.hasClass('deleted')) {
				quoteEl.addClass('none');
				favEl.addClass('none');
				replyEl.addClass('none');
			} else {
				quoteEl.removeClass('none');
				favEl.removeClass('none');
				replyEl.removeClass('none');
			}

			postEl.toggleClass('deleted');
		}
	})();
</script>