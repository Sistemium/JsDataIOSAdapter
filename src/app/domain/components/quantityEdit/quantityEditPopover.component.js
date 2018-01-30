'use strict';

(function () {

  const quantityEditPopover = {

    bindings: {
      article: '<',
      saleOrder: '<',
      price: '<',
      popoverOpen: '=',
      position: '<',
      stock: '<'
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEditPopover.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController($scope, IOS, Schema, DomainOption) {

    const {SaleOrderPosition} = Schema.models();

    let vm = this;

    let saleOrder = vm.saleOrder || _.get(vm.position, 'saleOrder');
    let article = vm.article || _.get(vm.position, 'article');
    let position = vm.position || _.find(_.get(saleOrder, 'positions'), {articleId: article.id});

    _.assign(vm, {

      showBottles: article.packageRel > 1,
      type: IOS.isIos() ? 'number' : 'text',
      bottleLabel: _.upperCase(article.pcsLabel),
      noFactor: !DomainOption.hasArticleFactors() || _.get(vm.saleOrder, 'outlet.partner.allowAnyVolume'),

      incrementBoxes: () => changeVolume(article.packageRel),
      incrementBottles: () => changeVolume(1),
      decrementBoxes: () => changeVolume(-article.packageRel),
      decrementBottles: () => changeVolume(-1),
      deleteClick,
      incrementHalfBoxes: () => changeVolume(Math.ceil(article.packageRel / 2))

    });

    /*
     Init
     */

    setQty();

    if (!position) {
      createPosition();
    }

    /*
     Listeners
     */

    $scope.$watchGroup(['vm.boxes', 'vm.bottles'], _.debounce(onQtyChange, 750));
    $scope.$watch('vm.position.id', onPositionChange);

    /*
     Functions
     */

    function createPosition() {

      let {stock} = vm;

      position = SaleOrderPosition.createInstance({
        saleOrderId: saleOrder.id,
        articleId: article.id,
        price: stock.discountPrice(),
        priceDoc: stock.priceOrigin(),
        priceOrigin: stock.priceOrigin(),
        volume: 0
      });

    }

    function onPositionChange(newPositionId, oldPositionId) {
      if (!newPositionId && oldPositionId) {
        createPosition();
      }
    }

    function deleteClick() {

      changeVolume(-position.volume);
      position.updateCost();
      saleOrder.updateTotalCost();

      if (vm.popoverOpen) vm.popoverOpen = false;

    }

    function onQtyChange(newValues, oldValues) {

      if (newValues[1] === oldValues[1] && newValues[0] === oldValues[0]) {
        return;
      }

      let volume = parseInt(newValues[0] * position.article.packageRel || 0)
        + parseInt(newValues[1] || 0);

      let factor = articleFactor(position);
      let notFactored = volume % factor;

      if (notFactored) {
        volume = volume - notFactored + factor;
      }

      position.volume = _.max([0, volume]);

      if (notFactored) {
        setQty();
      }

      injectPosition();
      position.updateCost();
      saleOrder.updateTotalCost();

    }

    function articleFactor(position) {
      return !vm.noFactor && _.get(position, 'article.factor') || 1;
    }

    function changeVolume(addVolume) {

      position.volume += addVolume;
      position.volume = _.max([0, position.volume]);

      let factor = articleFactor(position);
      let notFactored = position.volume % factor;

      if (notFactored) {
        position.volume = position.volume - notFactored + (addVolume > 0 ? factor : 0);
      }

      setQty();
      injectPosition();

    }

    function setQty() {
      let boxPcs = position ? position.article.boxPcs(position.volume, false) : {};
      _.assign(vm, {
        boxes: boxPcs.box,
        bottles: boxPcs.pcs
      });
    }

    function injectPosition() {
      if (!position.id) {
        SaleOrderPosition.inject(position);
      }
    }

  }

  angular.module('sistemium')
    .component('quantityEditPopover', quantityEditPopover);

})();
