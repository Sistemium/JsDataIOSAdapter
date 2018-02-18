'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      stock: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope, DomainOption, Schema, saEtc) {

    const vm = _.assign(this, {

      decrementPercentClick,
      incrementPercentClick,
      $onInit,
      profit

    });

    const {PriceGroup} = Schema.models();

    /*
     Init
     */

    function $onInit() {

      let {priceGroupId} = vm.stock.article;
      let hasPriceGroup = DomainOption.usePriceGroups() && priceGroupId || vm.stock.discountScope() === 'priceGroup';

      _.assign(vm, {
        editable: DomainOption.allowDiscounts(),
        discountScope: vm.stock.discountScope(),
        discountPercent: Math.abs(vm.stock.discountPercent()),
        mode: (vm.stock.discountPercent() || 0) >= 0 ? 'discount' : 'markup',
        price: vm.stock.discountPrice(),
        priceOrigin: vm.stock.priceOrigin(),
        priceGroup: hasPriceGroup && PriceGroup.get(priceGroupId),
        priceAgent: DomainOption.hasPriceAgent() && vm.stock.priceAgent
      });

      if (hasPriceGroup && !vm.priceGroup) {
        PriceGroup.find(priceGroupId)
          .then(res => vm.priceGroup = res);
      }

      if (!vm.discountPercent && vm.discountScope === 'saleOrder') {
        vm.discountScope = 'article';
      }

      /*
       Listeners
       */

      $scope.$watch('vm.discountPercent', saEtc.debounce(onDiscountChange, 700, $scope));
      $scope.$watch('vm.price', onPriceChange);
      $scope.$watch('vm.discountScope', onDiscountScopeChange);
      $scope.$watch('vm.mode', onDiscountChange);

    }

    /*
     Functions
     */

    function profit() {
      return (vm.price - vm.priceAgent) / vm.priceAgent * 100.0;
    }

    function onDiscountScopeChange(newDiscountScope, oldDiscountScope) {

      if (newDiscountScope === oldDiscountScope) return;

      vm.stock.setDiscountScope(newDiscountScope);
      vm.discountPercent = vm.stock.discountPercent(newDiscountScope);

    }

    function incrementPercentClick(increment = 1) {

      vm.discountPercent = vm.discountPercent || 0;
      vm.discountPercent += increment;

    }

    function decrementPercentClick() {

      vm.discountPercent = vm.discountPercent || 0;
      vm.discountPercent--;

    }

    // function onModeChange(newMode, oldMode) {
    //
    //   if (oldMode === newMode) {
    //     return;
    //   }
    //
    //   if (oldMode && newMode) {
    //     vm.discountPercent
    //   }
    //
    // }

    function normalizeDiscount() {

      if (vm.discountPercent > 30) {
        vm.discountPercent = 30;
      } else if (vm.discountPercent < 0) {
        vm.discountPercent = 0;
      }

      vm.discountPercent = _.round(vm.discountPercent, 2) || 0;

    }

    function onDiscountChange(newDiscount, oldDiscount) {

      if (newDiscount === oldDiscount) return;

      normalizeDiscount();

      // let {discountPercent} = vm;

      vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent());
      vm.price = vm.stock.discountPrice();
      // vm.mode = vm.discountPercent >= 0 ? 'discount' : 'markup';

    }

    function signedDiscountPercent() {
      return vm.mode === 'discount' ? vm.discountPercent : - vm.discountPercent;
    }

    function onPriceChange(newPrice, oldPrice) {

      if (newPrice === oldPrice) return;

      let price = _.round(parseFloat(newPrice), 2);

      if (!price) {
        vm.price = vm.stock.discountPrice();
      }

    }


  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
