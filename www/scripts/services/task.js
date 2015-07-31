'use strict';

app.factory('Task', function(FURL, $firebaseArray, $firebaseObject, Auth, toaster) {
	var ref = new Firebase(FURL);
	var tasks = $firebaseArray(ref.child('tasks'));
	var user = Auth.user;

	var Task = {
		all: tasks,

		getTask: function(taskId) {
			return $firebaseObject(ref.child('tasks').child(taskId));
			//return $firebase(ref.child('tasks').child(taskId));
		},

		getTaskTry: function(taskId) {
			tasks = ref.child('tasks').child(taskId);
			return tasks;
		},

		createTask: function(task) {
			task.datetime = Firebase.ServerValue.TIMESTAMP;
			return tasks.$add(task).then(function(newTask) {
				
				// Create User-Tasks lookup record for POSTER
				var obj = {
					taskId: newTask.key(),
					type: true,
					title: task.title
				}

				var userTaskRef = ref.child('user_tasks').child(task.poster); //New AF
				console.log("Obj Value: " + userTaskRef); //New AF
				return userTaskRef.push(obj); //New AF

				//return $firebase(ref.child('user_tasks').child(task.poster)).$push(obj); OLD AF
			});
		},

		createUserTasks: function(taskId) {
			Task.getTask(taskId)
				.$firebaseObject()
				.$loaded()
				.then(function(task) {
					
					// Create User-Tasks lookup record for RUNNER
					var obj = {
						taskId: taskId,
						type: false,
						title: task.title
					}

					return $firebaseObject(ref.child('user_tasks').child(task.runner).$push(obj));
					//return $firebase(ref.child('user_tasks').child(task.runner)).$push(obj);
				});
		},

		editTask: function(task) {
			var t = this.getTaskTry(task.$id);
			console.log("edit task clicked: " + task.$id);
			t = t.update({title: task.title, description: task.description, total: task.total});
			tasks = $firebaseArray(ref.child('tasks'));
			return t;

			//var t = this.getTask(task.$id);
			//return t.$update({title: task.title, description: task.description, total: task.total});

		},

		//NEW EDIT DT
		cancelTask: function(taskId) {
			//New DT for child_changed FireBase snapshot function
			var myTasks = new Firebase("https://taskrobot.firebaseio.com/tasks");

			var t = this.isCancelled(taskId);
			console.log("cancel task clicked w child_node: " + taskId);
			console.log("Tasks ref to to task object: " + tasks);
			//tasks = $firebaseObject(ref.child('tasks').child(taskId)); //returns [object Object] error

			// Attach an asynchronous callback to read the data at our tasks reference
			// Get child data SPECIFIC data where task 'status' is changed at any point.
			myTasks.on("child_changed", function(snapshot) {
				var changedTasks = snapshot.val();
				console.log("The task " + changedTasks.title + " created by " + changedTasks.name + "\n updated with child_changed event to: " + changedTasks.status);
				//toaster notifications
				if (changedTasks.status == 'cancelled') {
					toaster.pop('success', "Task cancelled successfully.");
				} else if (changedTasks.status == 'open') {
					toaster.pop('success', "Task activated successfully.");
				}
			}, function (errorObject) {
				console.log("The task child_changed read failed: " + errorObject.code);
			});


			// Attach an asynchronous callback to read the data at our tasks reference ID
			// Get ALL OBJ data for this OBJ ID
			tasks.on("value", function(snapshot) {
				console.log(snapshot.val());
			}, function (errorObject) {
				console.log("The task value read failed: " + errorObject.code);
			});

			return t.update({status: "cancelled"}, function(error) {
					if (error) {
						alert("Data could not be saved. " + error);
					} else {
						//alert("Data saved successfully.");
						//toaster.pop('success', "Task cancelled successfully.");
					}
			});
			//return t.$update({status: "cancelled"});
		},

		//New DT
		isCancelled: function(taskId) {
			tasks = ref.child('tasks').child(taskId);
			return tasks;
		},

		isCreator: function(task) {			
			return (user && user.provider && user.uid === task.poster);
		},

		isOpen: function(task) {
			return task.status === "open";
		},

		// --------------------------------------------------//

		isAssignee: function(task) {
			return (user && user.provider && user.uid === task.runner);	
		},

		completeTask: function(taskId) {
			var t = this.getTask(taskId);
			return t.$update({status: "completed"});
		},

		isCompleted: function(task) {
			return task.status === "completed";
		}
	};

	return Task;

});