'use strict';

(function () {
  function NavbarController(Auth,Menu) {

    var vm = this;

    angular.extend(vm, {

      menu: Menu.root (),

      isCollapsed: true

    }, Auth);


  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
