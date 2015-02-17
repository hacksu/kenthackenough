/**
* A definition of a staff header (the nav bar for the admin panel)
*/
angular
  .module('kheStaff')
  .directive('khestaffheader', [function () {
    return {
      templateUrl: '/views/directives/khestaffheader.html'
    };
  }]);