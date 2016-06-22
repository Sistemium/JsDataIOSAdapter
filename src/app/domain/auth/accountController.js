'use strict';

(function () {

  function AccountController (Auth) {

    var vm = this;

    vm.data = Auth.getAccount();
    vm.logout = Auth.logout;

  }

  angular.module('core.services')
    .controller('AccountController', AccountController);

})();
