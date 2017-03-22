'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      prices: '<',
      position: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEdit.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  function priceEditController() {

    let vm = this;

    _.assign(vm, {});

    /*
     Init
     */

    /*
     Listeners
     */

    /*
     Functions
     */

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
