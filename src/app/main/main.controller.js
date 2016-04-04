(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController(Auth, Menu) {
    var vm = this;

    vm.Auth = Auth;
    vm.data = Menu.root();

  }
})();
