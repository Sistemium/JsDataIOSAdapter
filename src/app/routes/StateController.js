(function () {

  angular.module('webPage')
    .controller('StateController', StateController);

  function StateController($state, $scope, localStorageService) {

    this.params = $state.params;
    this.locals = {};

    const {initLocals} = $state.current.data;

    if (initLocals) {
      initLocals(this.locals, { $state, localStorageService });
    }

    $scope.$watch(() => $state.current, () => {
      this.params = $state.params;
    });

    _.each($state.current.data.watch, (handler, expr) => {
      $scope.$watch(expr, value => {
        handler(value, { $state, localStorageService });
      });
    });

    _.each($state.current.data.on, (handler, name) => {
      $scope.$on(name, (event, value) => {
        handler(value, { $state, localStorageService });
      });
    });

  }

})();
