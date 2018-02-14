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

    if (!position) {
      createPosition();
    }

    setQty();

    /*
     Listeners
     */

    $scope.$watch('vm.volume', _.debounce(onVolumeChange, 750));
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
        priceAgent: stock.priceAgent,
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

    function onVolumeChange() {

      let {volume} = vm;

      if (volume === position.volume) {
        return;
      }

      let factor = articleFactor(position);
      let notFactored = volume % factor;

      if (notFactored) {
        volume = volume - notFactored + factor;
      }

      position.volume = _.max([0, volume]);

      injectPosition();

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

      injectPosition();

    }

    function setQty() {
      vm.volume = position.volume;
    }

    function injectPosition() {

      setQty();

      $scope.$applyAsync(() => {

        position.updateCost();

        if (!position.id) {
          SaleOrderPosition.inject(position);
        }

        saleOrder.updateTotalCost();

      });
    }

  }

  angular.module('sistemium')
    .component('quantityEditPopover', quantityEditPopover);

})();
