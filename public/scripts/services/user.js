/**
* User model
* Connects to the /users part of the API
* Also stores user locally via cookies
*/
angular
  .module('khe')
  .factory('User', ['$http', '$cookieStore', '$filter', function ($http, $cookies, $filter) {

    var User = function () {

      /**
      * Store the user locally
      * @param me An object representing the logged-in user
      *           {email: String, password: String, role: String}
      */
      this.setMe = function (me) {
        $cookies.put('me', me);
      };

      /**
      * Retrieve the logged in user from local storage
      * @return {email: String, password: String, role: String}
      */
      this.getMe = function () {
        return $cookies.get('me');
      };

      /**
      * Delete the stored user
      */
      this.removeMe = function () {
        $cookies.remove('me');
      };

      /**
      * Adds authorization headers to a request object
      * @param req A request object
      * @return The request object with auth headers attached
      */
      this.authorize = function (req) {
        var me = this.getMe();
        var encoded = $filter('base64Encode')(me.email + ':' + me.password);
        var ext = {
          headers: {
            'Authorization': 'Basic ' + encoded
          }
        };
        angular.extend(req, ext);
        return req;
      }

      /**
      * Register a user
      * @param user {email: String, password: String}
      * @return An $http promise
      */
      this.register = function (user) {
        var req = {
          method: 'POST',
          url: '/api/users/register',
          data: {
            email: user.email,
            password: user.password
          }
        };
        return $http(req);
      };

      /**
      * Activate a user
      * @param userId The user's ID
      * @return An $http promise
      */
      this.activate = function (userId) {
        var req = {
          method: 'GET',
          url: '/api/users/activate/' + userId
        };
        return $http(req);
      };

      /**
      * Login a user
      * @param user {email: String, password: String}
      * @return An $http promise
      */
      this.login = function (user) {
        var req = {
          method: 'POST',
          url: '/api/users/login',
          data: {
            email: user.email,
            password: user.password
          }
        };
        return $http(req);
      };

      /**
      * Return a list of all users (staff and admins only)
      * @return An $http promise
      */
      this.list = function () {
        var req = this.authorize({
          method: 'GET',
          url: '/api/users'
        });
        return $http(req);
      };

      /**
      * Unsubscribe from mailing list
      * @param userId The ID of the user to unsubscribe
      * @return An $http promise
      */
      this.unsubscribe = function (userId) {
        var req = this.authorize({
          method: 'POST',
          url: '/api/users/unsubscribe',
          data: {
            userId: userId
          }
        });
        return $http(req);
      };

      /**
      * Completely delete a user
      * @param userId The ID of the user to delete
      * @return An $http promise
      */
      this.delete = function (userId) {
        var req = this.authorize({
          method: 'POST',
          url: '/api/users/delete',
          data: {
            userId: userId
          }
        });
        return $http(req);
      };

    };

    return User;

  }]);