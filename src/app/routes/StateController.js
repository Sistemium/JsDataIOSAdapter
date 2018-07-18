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
    //
    // $scope.$watch(() => $state.current.name, name => {
    //   console.warn(name);
    //   this.params = $state.params;
    // });

    $scope.$on('$stateChangeSuccess', (event, to, toParams) => {
      //console.warn('$stateChangeSuccess', to, toParams);
      this.params = toParams;
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
