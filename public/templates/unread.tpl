<div class="unread">
	<ol class="breadcrumb">
		<li><a href="/">[[global:home]]</a></li>
		<li class="active">{category_name}</li>
		<div id="category_active_users"></div>
	</ol>

	<div class="alert alert-warning {no_topics_message}" id="category-no-topics">
		<strong>[[unread:no_unread_topics]]</strong>
	</div>

	<button id="mark-allread-btn" class="btn btn-primary {show_markallread_button}">[[unread:mark_all_read]]</button>

	<a href="/unread">
		<div class="alert alert-warning hide" id="new-topics-alert"></div>
	</a>

	<div class="category row">
		<div class="{topic_row_size}">
			<ul id="topics-container" data-next-start="{nextStart}">
			<!-- BEGIN topics -->
			<li class="category-item {topics.deleted-class}">
				<div class="row">
					<div class="col-md-12 topic-row">
						<a href="../../topic/{topics.slug}">
							<h3><span class="topic-title"><strong><i class="{topics.pin-icon}"></i> <i class="{topics.lock-icon}"></i></strong> {topics.title}</span></h3>
						</a>
						<small>
							<span class="topic-stats">
								<span class="badge {topics.badgeclass}">{topics.postcount}</span> posts
							</span>
							<span class="topic-stats">
								<span class="badge {topics.badgeclass}">{topics.viewcount}</span> views
							</span>
							|
							<span> posted in
								<a href="../../category/{topics.categorySlug}">
									<i class="{topics.categoryIcon}"></i> {topics.categoryName}
								</a>
							</span>

							<span class="pull-right hidden-xs">
								<a href="/user/{topics.userslug}">
									<img class="img-rounded teaser-pic" src="{topics.picture}" title="{topics.username}"/>
								</a>

								<a href="../../topic/{topics.slug}">
									<span>
										posted <span class="timeago" title="{topics.relativeTime}"></span>
									</span>
								</a>
								|
								<a href="/user/{topics.teaser_userslug}">
									<img class="img-rounded teaser-pic" src="{topics.teaser_userpicture}" title="{topics.teaser_username}"/>
								</a>
								<a href="../../topic/{topics.slug}#{topics.teaser_pid}">
									<span>
									 	replied <span class="timeago" title="{topics.teaser_timestamp}"></span>
									</span>
								</a>
							</span>
						</small>
					</div>
				</div>
			</li>
			<!-- END topics -->
			</ul>
			<button id="load-more-btn" class="btn btn-primary hide">[[unread:load_more]]</button>
		</div>
	</div>
</div>
