angular
  .module('khe')
  .directive('requireadmin', function () {
    return {

      restrict: 'E',
      transclude: true,

      templateUrl: '/views/directives/requireadmin.html',

      scope: {
        user: '=user',
        error: '=error'
      }

    };
  });