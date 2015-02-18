/**
* User model
* Connects to the /users part of the API
* Also stores user locally via cookies
*/
angular
  .module('khe')
  .factory('User', ['$http', '$cookieStore', function ($http, $cookies) {

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
      * Register a user
      * @param email The email to register with
      * @param password The password to register with
      * @return An $http promise
      */
      this.register = function (email, password) {
        var req = {
          method: 'POST',
          url: '/users/register',
          data: {
            email: email,
            password: password
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
          url: '/users/activate/' + userId
        };
        return $http(req);
      };

      /**
      * Login a user
      * @param email The email to attempt with
      * @param password The password to attempt with
      * @return An $http promise
      */
      this.login = function (email, password) {
        var req = {
          method: 'POST',
          url: '/users/login',
          data: {
            email: email,
            password: password
          }
        };
        return $http(req);
      };

    };

    return User;

  }]);