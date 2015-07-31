'use strict';

app.factory('Dashboard', function(FURL, $firebaseArray, $q) {
	var ref = new Firebase(FURL);

	var Dashboard = {
		
		getTasksForUser: function(uid) {
			var defer = $q.defer();

			$firebaseArray(ref.child('user_tasks').child(uid))
				//.$firebaseArray(ref)
				.$loaded()
				.then(function(tasks) {					
					defer.resolve(tasks);
				}, function(err) {
					defer.reject();
				});

			return defer.promise;
		}
	};

	return Dashboard;
});