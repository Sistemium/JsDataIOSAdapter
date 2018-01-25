'use strict';

(function (module) {

  const priceEdit = {

    bindings: {
      price: '<',
      position: '<',
      discount: '=',
      article: '='
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

      let percent = _.get(vm.discount, 'discount') || 0;

      return - percent;

    }

  }

  module.component('priceEdit', priceEdit);

})(angular.module('Sales'));
