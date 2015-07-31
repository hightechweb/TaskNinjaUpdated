'use strict';

app.controller('TaskController', function($scope, $location, $firebaseArray, $firebaseObject, toaster, Task, Auth) {

	$scope.createTask = function() {
		$scope.task.status = 'open';
		$scope.task.gravatar = Auth.user.profile.gravatar;
		$scope.task.name = Auth.user.profile.name;
		$scope.task.poster = Auth.user.uid;

		Task.createTask($scope.task).then(function(ref) {
			toaster.pop('success', 'Task created successfully.');
			console.log("Ref key value created: " + ref);
			$scope.task = {title: '', description: '', total: '', status: 'open', gravatar: '', name: '', poster: ''};
			//$location.path('/browse/' + ref.key()); OLD AF
			$location.path('/browse/' + ref.key()); ///URL routing to wrong key (parent) after task is created | LEO
		});
	};


	$scope.editTask = function(task) {
		Task.editTask(task).then(function() { //TypeError: Cannot read property 'then' of undefined | LEO
			toaster.pop('success', "Task is updated.");
		});
	};

});