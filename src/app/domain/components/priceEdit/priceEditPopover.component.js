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
      profit,
      signedDiscountPercent,
      target: ''

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
        mode: detectMode(),
        price: vm.stock.discountPrice(),
        priceDoc: vm.stock.discountPrice('Doc'),
        priceOrigin: vm.stock.priceOrigin(),
        priceGroup: hasPriceGroup && PriceGroup.get(priceGroupId),
        priceAgent: DomainOption.hasPriceAgent() && vm.stock.priceAgent,
<<<<<<< HEAD
        maxPrice: vm.stock.priceOrigin() * 1.3,
        minPrice: vm.stock.priceOrigin() * 0.7
=======
        maxDiscount: 50,
        maxPrice: vm.stock.priceOrigin() * 1.5,
        minPrice: vm.stock.priceOrigin() * 0.5
>>>>>>> salesSchema
      });

      if (hasPriceGroup && !vm.priceGroup) {
        PriceGroup.find(priceGroupId)
          .then(res => vm.priceGroup = res);
      }

      if (!vm.discountPercent && vm.discountScope === 'saleOrder') {
        vm.discountScope = 'article';
      }

      setPriceEdit();

      /*
       Listeners
       */

      $scope.$watch('vm.discountPercent', saEtc.debounce(onDiscountChange, 700, $scope));
      $scope.$watch('vm.priceEdit', saEtc.debounce(onPriceChange, 1500, $scope));
      $scope.$watch('vm.discountScope', onDiscountScopeChange);
<<<<<<< HEAD
      $scope.$watch('vm.mode', () => onDiscountChange(signedDiscountPercent(), 0));
=======
      $scope.$watch('vm.mode', onModeChange);
>>>>>>> salesSchema
      $scope.$watch('vm.target', onTargetChange);

    }

    /*
     Functions
     */

    function detectMode(percent = vm.stock.discountPercent() || 0) {

      if (vm.mode === 'price') return 'price';

      if (Math.abs(percent - _.round(percent, 2)) > 0) {
        return 'price';
      }

      return percent >= 0 ? 'discount' : 'markup';
    }

    function profit() {
      return (vm.price - vm.priceAgent) / vm.priceAgent * 100.0;
    }

    function onDiscountScopeChange(newDiscountScope, oldDiscountScope) {

      if (newDiscountScope === oldDiscountScope) return;

      if (oldDiscountScope) {
        vm.stock.setDiscountScope(newDiscountScope);
      }

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

      if (vm.mode !== 'price') {
        vm.discountPercent = _.round(vm.discountPercent, 2) || 0;
      }

    }

    function setPriceEdit() {

      let priceField = `price${vm.target}`;

      _.assign(vm, {
        priceEdit: vm[priceField],
        price: vm.stock.discountPrice(),
        priceDoc: vm.stock.discountPrice('Doc')
      });

    }

    function onTargetChange(newTarget, oldTarget) {

      if (newTarget === oldTarget) {
        return;
      }

      let targetDiscount = vm.stock.discountPercent(vm.discountScope, vm.target);

      vm.mode = detectMode(targetDiscount);

      vm.discountPercent = Math.abs(targetDiscount);

      setPriceEdit();
<<<<<<< HEAD
=======

      vm.keyBoardTouched = false;

    }

    function onModeChange() {

      onDiscountChange(signedDiscountPercent(), 0);
      vm.keyBoardTouched = false;
>>>>>>> salesSchema

    }

    function onDiscountChange(newDiscount, oldDiscount) {

      if (newDiscount === oldDiscount) return;

      if (!newDiscount && !oldDiscount) return;

      if (vm.mode === 'price') {
        return;
      }

      normalizeDiscount();

      // let {discountPercent} = vm;
<<<<<<< HEAD

      let priceField = `price${vm.target}`;

=======

      let priceField = `price${vm.target}`;

>>>>>>> salesSchema
      vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), vm.target);
      vm[priceField] = vm.stock.discountPrice(vm.target);
      setPriceEdit();

      if (vm.priceDoc < vm.price) {
        let otherTarget = (vm.target === 'Doc') ? '' : 'Doc';
        vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), otherTarget);
        setPriceEdit();
      }

    }

    function signedDiscountPercent() {

      switch (vm.mode) {
        case 'discount':
          return vm.discountPercent;
        case 'markup':
          return -vm.discountPercent;
        case 'price':
          return (vm.priceOrigin - vm.priceEdit) / vm.priceOrigin * 100.0;
      }

    }

    function onPriceChange(newPrice, oldPrice) {

      if (newPrice === oldPrice) return;

      let priceField = `priceEdit`;

      let price = _.round(parseFloat(newPrice), 2);

      if (!price) {
        price = vm[priceField] = vm.stock.discountPrice(vm.target);
      }

      if (price > vm.maxPrice || price < vm.minPrice) {
        vm.invalidPrice = true;
        return;
      }

      vm.invalidPrice = false;

      if (vm.mode === 'price') {
        vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), vm.target);
      }

    }


  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
