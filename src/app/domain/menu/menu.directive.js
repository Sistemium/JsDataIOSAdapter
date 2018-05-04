(function() {

  angular
    .module('webPage')
    .directive('stmMenu', menuDirective);

  /** @ngInject */
  function menuDirective($rootScope) {
    return {

      restrict: 'EA',
      templateUrl: 'app/domain/menu/menu.html',
      scope: {
        header: '=',
        items: '='
      },

      bindToController: true,
      controllerAs: 'vm',

      controller: function menuDirectiveController() {

        $rootScope.$broadcast('menu-show');

        _.assign(this, {
          isVisible
        });

        function isVisible(item) {

          return !item.disabled || !item.disabled();

        }

      }

    };
  }

})();
