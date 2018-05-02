'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      stock: '<',
      popoverOpen: '='
    },

    templateUrl: 'app/domain/sales/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope, DomainOption, Schema, saEtc, $filter) {

    const vm = _.assign(this, {

      decrementPercentClick,
      incrementPercentClick,
      $onInit,
      profit,
      signedDiscountPercent,
      discountPercentDisplay,
      showDoc,
      target: null

    });

    const {PriceGroup} = Schema.models();

    const numberFilter = $filter('number');

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

        maxDiscount: 50,
        maxPrice: vm.stock.priceOrigin() * 1.5,
        minPrice: vm.stock.priceOrigin() * 0.5

      });

      _.assign(vm, {
        target: vm.priceDoc === vm.price ? null : ''
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
      $scope.$watch('vm.mode', onModeChange);

      $scope.$watch('vm.target', onTargetChange);

    }

    /*
     Functions
     */

    function discountPercentDisplay(target = '') {

      let res = '';
      let field = `price${target}`;

      if (vm[field] === vm.priceOrigin) {
        return  '';
      }

      let percent = -vm.stock.discountPercent(vm.discountScope, target);

      if (percent > 0) {
        res = '+';
      }

      return `${res}${numberFilter(percent)}`;

    }

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

    function normalizeDiscount(discountPercent = vm.discountPercent) {

      if (discountPercent > 30) {
        discountPercent = 30;
      } else if (discountPercent < 0) {
        discountPercent = 0;
      }

      if (vm.mode !== 'price') {
        discountPercent = _.round(discountPercent, 2) || 0;
      }

      return vm.discountPercent = discountPercent;

    }

    function setPriceEdit() {

      let priceField = `price${vm.target || ''}`;

      _.assign(vm, {
        priceEdit: vm[priceField],
        price: vm.stock.discountPrice(),
        priceDoc: vm.stock.discountPrice('Doc')
      });

    }

    //
    // function discountPercentDoc() {
    //   return -vm.stock.discountPercent(null, 'Doc');
    // }

    function onTargetChange(newTarget, oldTarget) {

      if (newTarget === oldTarget) {
        return;
      }

      if (newTarget === null) {
        setDiscount(vm.stock.discountPercent(), 'Doc');
        setPrice(vm.price, 'Doc');
      } else if (oldTarget === null) {
        let {priceDoc} = vm;
        setDiscount(vm.stock.discountPercent(vm.discountScope, 'Doc'), 'Doc');
        setPrice(priceDoc, 'Doc');
      }

      let targetDiscount = vm.stock.discountPercent(vm.discountScope, vm.target || '');

      vm.mode = detectMode(targetDiscount);

      vm.discountPercent = Math.abs(targetDiscount);

      setPriceEdit();

      vm.keyBoardTouched = false;

    }

    function onModeChange() {

      onDiscountChange(signedDiscountPercent(), 0);
      vm.keyBoardTouched = false;

    }

    function setDiscount(newDiscount, target = vm.target || '') {

      normalizeDiscount(newDiscount);

      let priceField = `price${target}`;

      vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), target);
      vm[priceField] = vm.stock.discountPrice(target);

      setPriceEdit();

    }

    function onDiscountChange(newDiscount, oldDiscount) {

      if (newDiscount === oldDiscount) return;

      if (!newDiscount && !oldDiscount) return;

      if (vm.mode === 'price') {
        return;
      }

      let otherTarget = vm.target ? '' : 'Doc';

      if (vm.priceDoc === vm.price && vm.target !== null) {
        let currentPercent = vm.stock.discountPercent(vm.discountScope, vm.target) || 0;
        vm.stock.setDiscountScope(vm.discountScope, currentPercent, otherTarget);
      }

      setDiscount(newDiscount);

      if (vm.priceDoc < vm.price || vm.target === null) {
        vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), otherTarget);
        setPriceEdit();
      }


    }

    function signedDiscountPercent(discountPercent = vm.discountPercent) {

      switch (vm.mode) {
        case 'discount':
          return discountPercent;
        case 'markup':
          return -discountPercent;
        case 'price':
          return (vm.priceOrigin - vm.priceEdit) / vm.priceOrigin * 100.0;
      }

    }

    function setPrice(newPrice, target = vm.target || '') {

      let priceField = `priceEdit`;

      let price = _.round(parseFloat(newPrice), 2);

      if (!price) {
        price = vm[priceField] = vm.stock.discountPrice(target);
      }

      if (price > vm.maxPrice || price < vm.minPrice) {
        vm.invalidPrice = true;
        return;
      }

      vm.invalidPrice = false;

      if (vm.mode === 'price') {
        vm.stock.setDiscountScope(vm.discountScope, signedDiscountPercent(), target);
      }

      _.assign(vm, {
        price: vm.stock.discountPrice(),
        priceDoc: vm.stock.discountPrice('Doc')
      });

    }

    function onPriceChange(newPrice, oldPrice) {

      if (newPrice === oldPrice) return;

      setPrice(newPrice);

    }

    function showDoc() {
      return vm.priceDoc !== vm.price;
    }

  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
