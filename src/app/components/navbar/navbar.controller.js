'use strict';

(function () {
  function NavbarController(Auth) {

    var vm = this;

    angular.extend(vm, {

      menu: [{
        title: 'Home',
        state: 'home'
      },{
        title: 'Playground',
        state: 'playground'
      },{
        title: 'Picking',
        state: 'picking.orderList'
      }],

      isCollapsed: true

    }, Auth);


  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
