'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      price: '<',
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

      return -vm.discount;

    }

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
