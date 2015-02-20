angular
  .module('khe')
  .directive('staffsidebar', function () {
    return {

      restrict: 'E',
      transclude: true,

      templateUrl: '/views/directives/staffsidebar.html'

    };
  });