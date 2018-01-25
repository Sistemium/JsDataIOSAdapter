'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      positions: '<',
      stock: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope, DomainOption, Schema) {

    const vm = _.assign(this, {

      decrementPercentClick,
      incrementPercentClick,
      $onInit

    });

    const {PriceGroup} = Schema.models();

    /*
     Init
     */

    function $onInit() {

      let {priceGroupId} = vm.stock.article;

      _.assign(vm, {
        editable: DomainOption.allowDiscounts(),
        discountScope: vm.stock.discountScope(),
        discountPercent: vm.stock.discountPercent(),
        price: vm.stock.discountPrice(),
        priceOrigin: vm.stock.priceOrigin(),
        priceGroup: PriceGroup.get(priceGroupId)
      });

      if (!vm.priceGroup) {
        PriceGroup.find(priceGroupId)
          .then(res => vm.priceGroup = res);
      }

      /*
       Listeners
       */

      $scope.$watch('vm.discountPercent', onDiscountChange);
      $scope.$watch('vm.price', onPriceChange);
      $scope.$watch('vm.discountScope', onDiscountScopeChange);

    }

    /*
     Functions
     */

    function onDiscountScopeChange(newDiscountScope) {

      vm.stock.setDiscountScope(newDiscountScope, vm.discountPercent);

    }

    function incrementPercentClick() {

      vm.discountPercent = vm.discountPercent || 0;
      vm.discountPercent++;

      vm.priceObject = vm.priceObject || {};

      normalizeDiscount();

    }

    function decrementPercentClick() {

      vm.discountPercent = vm.discountPercent || 0;
      vm.discountPercent--;

      normalizeDiscount();

    }

    function normalizeDiscount() {

      if (vm.discountPercent > 30) {
        vm.discountPercent = 30;
      } else if (vm.discountPercent < 0) {
        vm.discountPercent = 0;
      }

      vm.discountPercent = _.round(vm.discountPercent, 2);

    }

    function onDiscountChange() {

      let discountPercent = vm.discountPercent || 0;

      vm.stock.setDiscountScope(vm.discountScope, discountPercent);
      vm.price = vm.stock.discountPrice();

    }

    function onPriceChange(newPrice) {

      let price = _.round(parseFloat(newPrice), 2);

      if (!price) {
        vm.price = vm.stock.discountPrice();
        return;
      }

      // TODO: carefully update vm.discount not to trigger recursion

      let position = vm.positions[vm.stock.articleId];

      if (!position || _.round(Math.abs(price - position.price), 2) < 0.01) return;

      position.price = price;
      position.updateCost();
      position.saleOrder.updateTotalCost();

    }


  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
