angular
  .module('khe')
  .factory('Message', ['$http', 'User', function ($http, User) {

    var Message = function () {

      var self = this;
      var user = new User();

      /**
      * Get a list of messages
      * @return An $http promise
      */
      self.list = function () {
        var req = {
          method: 'GET',
          url: '/api/messages'
        };
        return $http(req);
      };

      /**
      * Get a message by id
      * @param id The message id
      * @return An $http promise
      */
      self.get = function (id) {
        var req = {
          method: 'GET',
          url: '/api/messages/' + id
        };
        return $http(req);
      };

      /**
      * Create a new message
      * @param text The string of the message
      * @return An $http promise
      */
      self.create = function (text) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/messages',
          data: {text: text}
        });
        return $http(req);
      };

      /**
      * Delete a message
      * @param id The message ID
      * @return An $http promise
      */
      self.delete = function (id) {
        var req = user.authorize({
          method: 'DELETE',
          url: '/api/messages/' + id
        });
        return $http(req);
      };

    };

    return Message;

  }]);