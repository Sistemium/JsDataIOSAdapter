(function () {

  angular.module('webPage')
    .controller('StateController', StateController);

  function StateController($state, $scope) {

    this.params = $state.params;

    $scope.$watch(() => $state.current, () => {
      this.params = $state.params;
    });

    _.each($state.current.data.watch, (handler, expr) => {
      $scope.$watch(expr, value => {
        handler(value, $state);
      });
    });

  }

})();
