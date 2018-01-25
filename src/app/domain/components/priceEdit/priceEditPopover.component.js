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
        priceGroup: priceGroupId && PriceGroup.get(priceGroupId)
      });

      if (priceGroupId && !vm.priceGroup) {
        PriceGroup.find(priceGroupId)
          .then(res => vm.priceGroup = res);
      }

      if (!vm.discountPercent && vm.discountScope === 'saleOrder') {
        vm.discountScope = 'article';
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

    function onDiscountScopeChange(newDiscountScope, oldDiscountScope) {

      if (newDiscountScope === oldDiscountScope) return;

      vm.stock.setDiscountScope(newDiscountScope);
      vm.discountPercent = vm.stock.discountPercent(newDiscountScope);

    }

    function incrementPercentClick() {

      vm.discountPercent = vm.discountPercent || 0;
      vm.discountPercent++;

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
