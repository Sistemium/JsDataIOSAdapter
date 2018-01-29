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
      let hasPriceGroup = DomainOption.usePriceGroups() && priceGroupId || vm.stock.discountScope() === 'priceGroup';

      _.assign(vm, {
        editable: DomainOption.allowDiscounts(),
        discountScope: vm.stock.discountScope(),
        discountPercent: vm.stock.discountPercent(),
        price: vm.stock.discountPrice(),
        priceOrigin: vm.stock.priceOrigin(),
        priceGroup: hasPriceGroup && PriceGroup.get(priceGroupId)
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

      $scope.$watch('vm.discountPercent', _.debounce(onDiscountChange, 700));
      $scope.$watch('vm.price', onPriceChange);
      $scope.$watch('vm.discountScope', onDiscountScopeChange);

    }

    /*
     Functions
     */

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

      let {discountPercent} = vm;

      vm.stock.setDiscountScope(vm.discountScope, discountPercent);
      vm.price = vm.stock.discountPrice();

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
