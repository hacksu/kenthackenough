/**
* Url model
* Connects to the /urls part of the API
*/
angular
  .module('khe')
  .factory('Url', ['$http', 'User', function ($http, User) {

    var Url = function () {

      var user = new User();

      /**
      * Shorten a url
      * @param full The full length URL to resolve to
      * @param small The shortcut URL
      * @return An $http promise
      */
      this.shorten = function (full, small) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/urls/shorten',
          data: {
            full: full,
            short: small
          }
        });
        return $http(req);
      };

      /**
      * Remove a url
      * @param id The URL object's ID
      * @return An $http promise
      */
      this.remove = function (id) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/urls/remove',
          data: {
            id: id
          }
        });
        return $http(req);
      };

      /**
      * Get a list of urls
      * @return An $http promise
      */
      this.list = function () {
        var req = user.authorize({
          method: 'GET',
          url: '/api/urls'
        });
        return $http(req);
      };

    };

    return Url;

  }]);