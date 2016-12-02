'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, saControllerHelper, ClickHelper, Schema) {

    let {SaleOrder, SaleOrderPosition} = Schema.models('SaleOrder');
    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);
    let saleOrderId = $state.params.saleOrderId;

    vm.use({

      kButtonClick,
      bButtonClick

    });

    vm.currentSaleOrderId = !!$state.params.saleOrderId;

    SaleOrder.find(saleOrderId)
      .then(saleOrder => {
        vm.saleOrder = saleOrder;
        SaleOrder.loadRelations(saleOrder, 'SaleOrderPosition');
      });

    function kButtonClick(data) {
      addPositionVolume(data.stock.articleId, data.stock.article.packageRel, data.price);
    }

    function bButtonClick(data) {
      addPositionVolume(data.stock.articleId, 1, data.price);
    }

    function addPositionVolume (articleId, volume, price) {
      let position = _.find(vm.saleOrder.positions, {articleId: articleId});
      if (!position) {
        position = SaleOrderPosition.createInstance({
          saleOrderId: vm.saleOrder.id,
          volume: 0,
          price: price,
          priceDoc: price,
          articleId: articleId
        });
      }
      position.volume += volume;
      position.cost = position.volume * price;
      vm.saleOrder.totalCost += volume * price;
      SaleOrderPosition.inject(position);
    }

  }

  angular.module('webPage')
    .controller('CatalogueSaleOrderController', CatalogueSaleOrderController);

})();
