<ul class="topic-container">
<!-- BEGIN posts -->
<li class="topic-row">
	<p>{posts.content}</p>
	<p>Posted {posts.relativeTime} by user {posts.uid}.</p>
</li>
<!-- END posts -->
</ul>
<hr />
<button id="post_reply" class="btn btn-primary btn-large">Reply</button>
<script type="text/javascript">
var post_reply = document.getElementById('post_reply');
post_reply.onclick = function() {
	app.open_post_window('reply', {TOPIC_ID});
}
</script>
