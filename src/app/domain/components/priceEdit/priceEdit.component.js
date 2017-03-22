'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      prices: '<',
      position: '<',
      discount: '='
    },

    templateUrl: 'app/domain/components/priceEdit/priceEdit.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  function priceEditController() {

    let vm = this;

    _.assign(vm, {

      discountPercent

    });

    /*
     Init
     */

    /*
     Listeners
     */

    /*
     Functions
     */

    function discountPercent() {

      if (!vm.position) return -vm.discount;

      return _.round(vm.position.price / vm.position.priceOrigin * 100 - 100, 1);

    }

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
