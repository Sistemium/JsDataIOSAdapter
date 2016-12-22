'use strict';

(function () {

  const quantityEditPopover = {

    bindings: {
      article: '=',
      saleOrder: '=',
      price: '=',
      popoverOpen: '=?',
      position: '=?'
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEditPopover.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController($scope, IOS, Schema) {

    const {SaleOrderPosition} = Schema.models();

    let vm = this;

    let saleOrder = vm.saleOrder || _.get(vm.position, 'saleOrder');
    let article = vm.article || _.get(vm.position, 'article');
    let position = vm.position || _.find(_.get(saleOrder, 'positions'), {articleId: article.id});
    let price = vm.price || _.get(vm.position, 'price');

    _.assign(vm, {

      showBottles: article.packageRel > 1,
      type: IOS.isIos() ? 'number' : 'text',
      bottleLabel: _.upperCase(article.pcsLabel),

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
      position = SaleOrderPosition.createInstance({
        saleOrderId: saleOrder.id,
        articleId: article.id,
        price: price,
        priceDoc: price,
        priceOrigin: price,
        volume: 0
      });
    }

    /*
     Listeners
     */

    $scope.$watchGroup(['vm.boxes', 'vm.bottles'], onQtyChange);

    /*
     Functions
     */

    function deleteClick() {
      if (position.id && !vm.deleteConfirmation) {
        return vm.deleteConfirmation = true;
      }
      if (position.id) {
        changeVolume(-position.volume);
      }
      if (vm.popoverOpen) vm.popoverOpen = false;
    }

    function onQtyChange(newValues, oldValues) {
      if (newValues[1] != oldValues[1] || newValues[0] != oldValues[0]) {
        let volume = parseInt(newValues[0] * position.article.packageRel || 0)
          + parseInt(newValues[1] || 0);
        position.volume = _.max([0, volume]);
        injectPosition();
        position.updateCost();
        saleOrder.updateTotalCost();
      }
    }

    function changeVolume(addVolume) {
      position.volume += addVolume;
      position.volume = _.max([0, position.volume]);
      setQty();
      injectPosition();
    }

    function setQty() {
      let boxPcs = position ? position.article.boxPcs(position.volume) : {};
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
