'use strict';

(function () {

  const quantityEditComponent = {

    bindings: {
      stock: '=',
      saleOrder: '=',
      price: '='
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController($scope, IOS, Schema) {

    const {SaleOrderPosition} = Schema.models();

    let vm = this;

    let positions = _.get(vm.saleOrder, 'positions');
    let position = _.find(positions, {articleId: vm.stock.articleId});
    let article = vm.stock.article;

    _.assign(vm, {

      type: IOS.isIos() ? 'number' : 'text',

      incrementBoxes: () => changeVolume(article.packageRel),
      incrementBottles: () => changeVolume(1),
      decrementBoxes: () => changeVolume(-article.packageRel),
      decrementBottles: () => changeVolume(-1)

    });

    /*
     Init
     */

    setQty();

    if (!position) {
      position = SaleOrderPosition.createInstance({
        saleOrderId: vm.saleOrder.id,
        articleId: article.id,
        price: vm.price,
        priceDoc: vm.price,
        priceOrigin: vm.price,
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

    function onQtyChange(newValues, oldValues) {
      if (newValues[1] != oldValues[1] || newValues[0] != oldValues[0]) {
        let volume  = parseInt(newValues[0] * position.article.packageRel || 0)
          + parseInt(newValues[1] || 0);
        position.volume = _.max([0, volume]);
        injectPosition();
        position.updateCost();
        vm.saleOrder.updateTotalCost();
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
    .component('quantityEdit', quantityEditComponent);

})();
