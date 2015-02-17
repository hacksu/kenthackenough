(function () {

  var app = angular.module('khe.controllers', []);

  app
    .controller('StaffController', ['$http', '$scope', function ($http, $scope) {
      $http.get('/users');
    }]);

  app
    .directive('staffheader', function () {
      return {
        templateUrl: '/partials/staff-header.html'
      };
    })
    .directive('staffattendeesidebar', function () {
      return {
        templateUrl: '/partials/staff-attendee-sidebar.html'
      };
    });

})();