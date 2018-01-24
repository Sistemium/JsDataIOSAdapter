'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      priceObject: '<',
      popoverOpen: '=',
      position: '<',
      discount: '='
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
      decrementPercentClick,
      incrementPercentClick,
      $onInit

    });

    /*
     Init
     */

    function incrementPercentClick() {

      vm.discount = vm.discount || 0;
      vm.discount++;

      vm.priceObject = vm.priceObject || {};

      normalizeDiscount();

    }

    function decrementPercentClick() {

      vm.discount = vm.discount || 0;
      vm.discount--;

      normalizeDiscount();

    }

    function normalizeDiscount() {

      if (vm.discount > 30) {
        vm.discount = 30;
      } else if (vm.discount < 0) {
        vm.discount = 0;
      }

      vm.discount = _.round(vm.discount, 2);

    }

    function $onInit() {
      _.assign(vm, _.pick(vm.position || vm.priceObject, ['price', 'priceOrigin', 'priceDoc']));
      vm.ksOption = vm.position && DomainOption.hasSaleOrderKS();
      vm.editable = DomainOption.allowDiscounts();
    }

    /*
     Listeners
     */

    $scope.$watch('vm.discount', onDiscountChange);
    $scope.$watch('vm.price', onPriceChange);

    /*
     Functions
     */

    function onDiscountChange() {

      let discount = vm.discount || 0;

      vm.price = _.round(vm.priceObject.priceOrigin * (1.0 - discount/100.0), 2);

    }

    function onPriceChange(newPrice) {

      let price = _.round(parseFloat(newPrice), 2);

      if (!price) {
        vm.price = vm.priceObject.price;
        return;
      }

      vm.priceObject.price = price;

      // TODO: carefully update vm.discount not to trigger recursion

      if (!vm.position || _.round(Math.abs(price - vm.position.price), 2) < 0.01) return;

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
