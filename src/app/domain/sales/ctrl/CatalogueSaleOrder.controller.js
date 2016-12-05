'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, saControllerHelper, ClickHelper, Schema, $q) {

    let {SaleOrder, SaleOrderPosition} = Schema.models('SaleOrder');
    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);
    let saleOrderId = $state.params.saleOrderId;

    vm.use({

      kPlusButtonClick,
      bPlusButtonClick,
      orderedVolumeClick: stock => console.warn(stock)

    });

    if (saleOrderId) {
      SaleOrder.find(saleOrderId)
        .then(saleOrder => {
          vm.saleOrder = saleOrder;
          return SaleOrder.loadRelations(saleOrder, 'SaleOrderPosition')
            .then(() => $q.all(_.map(saleOrder.positions, pos => SaleOrderPosition.loadRelations(pos))));
        })
        .catch(error => console.error(error));
    } else {
      // TODO: createInstance and setup with SalesmanAuth.getCurrentUser(), date: today()+1
    }

    /*
    Handlers
     */

    function kPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, data.stock.article.packageRel, data.price);
    }

    function bPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, 1, data.price);
    }

    /*
    Functions
     */

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
