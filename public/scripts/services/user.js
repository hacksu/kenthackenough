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
      * Adds authorization headers to a request object
      * @param req A request object
      * @return The request object with auth headers attached
      */
      this.authorize = function (req) {
        var me = this.getMe();
        var encoded = base64Encode(me.email + ':' + me.password);
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

    };

    return User;

  }]);