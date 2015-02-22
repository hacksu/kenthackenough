/**
* Application model
* Connects to the /application part of the API
*/
angular
  .module('khe')
  .factory('Application', ['$http', 'User', function ($http, User) {

    var Application = function () {

      var user = new User();

      this.APPROVED = 'approved';
      this.DENIED = 'denied';
      this.WAITLISTED = 'waitlisted';
      this.PENDING = 'pending';

      /**
      * Submit an application
      * @param application An application object
      * @return An $http promise
      */
      this.submit = function (application) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/submit',
          data: application
        });
        return $http(req);
      };

      /**
      * Update an application
      * @param application An application object
      * @return An $http promise
      */
      this.update = function (application) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/update',
          data: application
        });
        return $http(req);
      };

      /**
      * Set RSVP status
      * @param going True if attending, otherwise false
      * @return An $http promise
      */
      this.rsvp = function (going) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/rsvp',
          data: {
            going: going
          }
        });
        return $http(req);
      };

      /**
      * Get the logged in user's application
      * @return An $http promise
      */
      this.get = function () {
        var req = user.authorize({
          method: 'GET',
          url: '/api/application'
        });
        return $http(req);
      };

      /**
      * Set an application's status (for staff)
      * @param userId The ID of the user to set the status of
      * @param status The status to set
      * @return An $http promise
      */
      this.status = function (userId, status) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/status',
          data: {
            userId: userId,
            status: status
          }
        });
        return $http(req);
      };

      /**
      * Softly remove a user's application
      * @param userId The ID of the user to remove
      * @return An $http promise
      */
      this.remove = function (userId) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/remove',
          data: {
            userId: userId
          }
        });
        return $http(req);
      };

      /**
      * Quickly register an attendee (for use at the door)
      * @param quickApp {name: String, email: String, phone: String}
      * @return An $http promise
      */
      this.quick = function (quickApp) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/quick',
          data: quickApp
        });
        return $http(req);
      };

      /**
      * Update a user's application by user ID
      * @param userId The user to update
      * @param data {status: 'approved'|'denied'|'waitlisted'|'pending',
      *              checked: true|false} (both properties optional)
      * @return An $http promise
      */
      this.updateById = function (userId, data) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/application/update/' + userId,
          data: data
        });
        return $http(req);
      };

    };

    return Application;

  }]);