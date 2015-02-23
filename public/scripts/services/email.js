angular
  .module('khe')
  .factory('Email', ['$http', 'User', function ($http, User) {

    var Email = function () {

      var user = new User();

      /**
      * Send an email
      * @param email An email object (see API docs)
      * @return An $http promise
      */
      this.send = function (email) {
        var req = user.authorize({
          method: 'POST',
          url: '/api/emails/send',
          data: email
        });
        return $http(req);
      };

      /**
      * Get a list of sent emails
      * @return An $http promise
      */
      this.list = function () {
        var req = user.authorize({
          method: 'GET',
          url: '/api/emails'
        });
        return $http(req);
      };

    };

    return Email;

  }]);