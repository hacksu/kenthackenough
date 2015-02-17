/**
* User model
* Register a user, store the logged-in user, and logout
*/

angular
  .module('kheStaff')
  .service('User', ['$http', '$scope', function ($http, $scope) {

    return {

      register: function () {
        var req = {
          method: 'POST',
          url: '/users/register',
          data: {
            email: $scope.me.email,
            password: $scope.me.password
          }
        };
        $http(req)
          .success(function (data) {
            $scope.me.loggedIn = true;
          })
          .error(function (data, status) {
            $scope.me.loggedIn = false;
            console.log(data);
          });
      },

      me: function () {
        return $scope.me;
      },

      logout: function () {
        $scope.me = {};
      }

    };

  }]);