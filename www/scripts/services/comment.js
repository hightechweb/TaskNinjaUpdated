'use strict';

app.factory('Comment', function(FURL, $firebaseArray) {

	var ref = new Firebase(FURL);	

	var Comment = {
		comments: function(taskId) {
			return $firebaseArray(ref.child('comments').child(taskId)); //$firebase
		},

		addComment: function(taskId, comment) {
			var task_comments = this.comments(taskId);
			comment.datetime = Firebase.ServerValue.TIMESTAMP;

			if(task_comments) {
				return task_comments.$add(comment);	
			}			
		}
	};

	return Comment;
});