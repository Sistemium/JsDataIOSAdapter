'use strict';

(function () {

  const quantityEditComponent = {

    bindings: {
      stock: '=',
      saleOrder: '=',
      price: '=',
      popoverOpen: '=?'
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController($scope, IOS, Schema, toastr) {

    const {SaleOrderPosition, SaleOrder} = Schema.models();

    let vm = this;

    let positions = _.get(vm.saleOrder, 'positions');
    let position = _.find(positions, {articleId: vm.stock.articleId});
    let article = vm.stock.article;

    _.assign(vm, {

      article,
      showBottles: vm.stock.article.packageRel > 1,
      type: IOS.isIos() ? 'number' : 'text',

      incrementBoxes: () => changeVolume(article.packageRel),
      incrementBottles: () => changeVolume(1),
      decrementBoxes: () => changeVolume(-article.packageRel),
      decrementBottles: () => changeVolume(-1),
      deleteClick,
      incrementHalfBoxes: () => changeVolume(Math.ceil(article.packageRel/2))

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

    const debouncedSave = _.debounce(savePosition, 500);

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
        SaleOrderPosition.eject(position);
        vm.saleOrder.updateTotalCost();
      }
      if (vm.popoverOpen) vm.popoverOpen = false;
    }

    function onQtyChange(newValues, oldValues) {
      if (newValues[1] != oldValues[1] || newValues[0] != oldValues[0]) {
        let volume  = parseInt(newValues[0] * position.article.packageRel || 0)
          + parseInt(newValues[1] || 0);
        position.volume = _.max([0, volume]);
        injectPosition();
        position.updateCost();
        vm.saleOrder.updateTotalCost();
        debouncedSave();
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

    function errorHandler(text) {
      return function (err) {
        toastr.error(text, 'Ошибка');
        SaleOrderPosition.revert(position);
        SaleOrder.revert(position.saleOrderId);
      }
    }

    function savePosition() {
      if (position.volume > 0) {
        SaleOrderPosition.save(position)
          .then(() => SaleOrder.save(vm.saleOrder))
          .catch(errorHandler('Позиция не сохранена.'));
      } else {
        SaleOrderPosition.destroy(position)
          .then(() => SaleOrder.save(vm.saleOrder))
          .then(() => {
            position = null;
          })
          .catch(err => {
            SaleOrderPosition.inject(position);
            errorHandler('Позиция не удалена.')(err)
          });
      }
    }

  }

  angular.module('sistemium')
    .component('quantityEdit', quantityEditComponent);

})();
