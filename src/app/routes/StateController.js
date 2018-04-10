(function () {

  angular.module('webPage')
    .controller('StateController', StateController);

  function StateController($state) {
    this.params = $state.params;
  }

})();
