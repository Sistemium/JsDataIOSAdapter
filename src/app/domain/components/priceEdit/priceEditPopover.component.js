'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      priceObject: '<',
      popoverOpen: '=',
      position: '<',
      discount: '=',
      article: '='
    },

    templateUrl: 'app/domain/components/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope, DomainOption, Schema) {

    const vm = _.assign(this, {

      ksButtonClick,
      decrementPercentClick,
      incrementPercentClick,
      $onInit

    });

    const {PriceGroup} = Schema.models();

    /*
     Init
     */

    function $onInit() {

      let {priceGroupId} = vm.article;

      _.assign(vm, _.pick(vm.position || vm.priceObject, ['price', 'priceOrigin', 'priceDoc']));

      _.assign(vm, {
        ksOption: vm.position && DomainOption.hasSaleOrderKS(),
        editable: DomainOption.allowDiscounts(),
        discountScope: _.get(vm.discount, 'scope') || 'article',
        discountPercent: _.get(vm.discount, 'discount'),
        priceGroup: PriceGroup.get(priceGroupId)
      });

      if (!vm.priceGroup) {
        PriceGroup.find(priceGroupId)
          .then(res => vm.priceGroup = res);
      }

    }

    /*
     Listeners
     */

    $scope.$watch('vm.discountPercent', onDiscountChange);
    $scope.$watch('vm.price', onPriceChange);

    /*
     Functions
     */


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

      vm.price = _.round(vm.priceObject.priceOrigin * (1.0 - discountPercent/100.0), 2);

      if (discountPercent && !vm.discount) {
        vm.discount = {
          scope: vm.discountScope
        }
      }

      if (vm.discount) {
        vm.discount.discount = discountPercent;
      }

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
