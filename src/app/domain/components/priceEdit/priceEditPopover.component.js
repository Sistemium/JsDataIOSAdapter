'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      priceObject: '<',
      popoverOpen: '=',
      position: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope, DomainOption) {

    let vm = this;

    _.assign(vm, {

      ksButtonClick,
      $onInit

    });

    /*
     Init
     */

    function $onInit() {
      _.assign(vm, _.pick(vm.position || vm.priceObject, ['price', 'priceOrigin', 'priceDoc']));
      vm.ksOption = vm.position && DomainOption.hasSaleOrderKS();
    }

    /*
     Listeners
     */

    $scope.$watch('vm.price', onPriceChange);

    /*
     Functions
     */

    function onPriceChange(newPrice) {

      if (!newPrice || !vm.position) {
        return;
      }

      let price = parseFloat(newPrice);

      if (!price || _.round(Math.abs(price - vm.position.price), 2) < 0.01) return;

      vm.position.price = price;
      vm.position.updateCost();
      vm.position.saleOrder.updateTotalCost();

    }

    function ksButtonClick() {
      vm.position.isCompDiscount = !vm.position.isCompDiscount;
      vm.position.DSCreate()
        .then(() => vm.popoverOpen = false);
    }


  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
