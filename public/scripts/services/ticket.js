angular
  .module('khe')
  .factory('Ticket', ['$http', 'User', function ($http, User) {

    var Ticket = function () {

      var self = this;
      var user = new User();

      /**
      * Get a list of tickets
      */
      self.list = function () {
        var req = user.authorize({
          method: 'GET',
          url: '/api/tickets'
        });
        return $http(req);
      };

      /**
      * Get a single ticket
      * @param id The ticket ID
      */
      self.get = function (id) {
        var req = user.authorize({
          method: 'GET',
          url: '/api/tickets/'+id
        });
        return $http(req);
      };

      /**
      * Create a new ticket
      * @param ticket {subject: String, body: String, replyTo: String}
      */
      self.create = function (ticket) {
        var req = {
          method: 'POST',
          url: '/api/tickets',
          data: ticket
        };
        return $http(req);
      };

      /**
      * Update a ticket by ID
      * @param id The ticket ID
      * @param toUpdate An object containing the fields to update
      */
      self.update = function (id, toUpdate) {
        var req = user.authorize({
          method: 'PATCH',
          url: '/api/tickets/'+id,
          data: toUpdate
        });
        return $http(req);
      };

      /**
      * Delete a ticket
      * @param id The ticket ID
      */
      self.delete = function (id) {
        var req = user.authorize({
          method: 'DELETE',
          url: '/api/tickets/'+id
        });
        return $http(req);
      };

    };

    return Ticket;

  }]);