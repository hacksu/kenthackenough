angular.module('khe', ['ngRoute', 'ngCookies', 'kheStaff', 'kheAttendees']);
angular.module('kheStaff', []);
angular.module('kheAttendees', []);

angular.module('khe').config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode(true);
}]);