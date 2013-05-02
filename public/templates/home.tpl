<button id="new_post" class="btn btn-primary btn-large">New Post</button>
<ul class="topic-container">
<!-- BEGIN topics -->
<a href="topic/{topics.slug}"><li class="topic-row">
	<h4>{topics.title}</h4>
	<p>Posted {topics.relativeTime} by user <span id="username"></span>. {topics.post_count} posts.</p>
</li></a>
<!-- END topics -->
</ul>
<script type="text/javascript">
var new_post = document.getElementById('new_post');
new_post.onclick = function() {
	app.open_post_window();
}

jQuery('document').ready(function() {
	var userId = {topics.uid};
	
	socket.on('api:user.get', function(userObj) {
 		console.log("derp");
		console.log(userObj);
		
	});
	
	socket.emit('api:user.get', { fields: [ 'uid' ], 'uid': userId });
	
	
});


/*app.alert({
	title: 'Welcome back',
	message: 'Some welcome message to test alerts!',
	type: 'info',
	timeout: 2000
});*/
</script>