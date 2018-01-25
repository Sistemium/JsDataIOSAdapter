'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      stock: '<',
      positions: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEdit.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  function priceEditController() {

    let vm = this;

    _.assign(vm, {

      discountPercent,
      discountPrice

    });

    /*
     Functions
     */

    function discountPrice() {
      return vm.stock.discountPrice();
    }

    function discountPercent() {

      return - vm.stock.discountPercent();

    }

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
