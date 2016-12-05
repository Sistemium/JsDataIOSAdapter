'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, saControllerHelper, ClickHelper, Schema, $q, SalesmanAuth, saEtc) {

    let {SaleOrder, SaleOrderPosition, Outlet} = Schema.models('SaleOrder');
    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);
    let saleOrderId = $state.params.saleOrderId;

    vm.use({

      kPlusButtonClick,
      bPlusButtonClick,
      newOrder: false,
      setOutlet,
      clearSearchClick,
      saveOrder,
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

      Outlet.findAll({}).then((data) => {
        vm.outlets = data;
      });

      vm.newOrder = true;

      vm.saleOrder = SaleOrder.createInstance({
        salesmanId: SalesmanAuth.getCurrentUser().id,
        date: moment().add(1, 'days').format('YYYY-MM-DD'),
      });

      // TODO: createInstance and setup with SalesmanAuth.getCurrentUser(), date: today()+1
    }

    /*
     Handlers
     */

    $scope.$watch('vm.search', (newValue, oldValue) => {
      if (newValue != oldValue) searchOutlet()
    });

    function clearSearchClick() {
      vm.search = '';
      saEtc.focusElementById('search-input');
    }

    function saveOrder() {
      vm.saleOrder.processing = 'draft';
      SaleOrder.create(vm.saleOrder).then((a) => {
        console.log(a);
      }).catch(e => console.error(e));
    }

    function searchOutlet() {
      let filter = {};

      if (vm.search) {
        filter.name = {
          'likei': '%' + vm.search + '%'
        }
      }

      vm.outlets = Outlet.filter({
        where: filter
      });

    }

    function kPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, data.stock.article.packageRel, data.price);
    }

    function bPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, 1, data.price);
    }

    /*
     Functions
     */

    function setOutlet(outlet) {
      vm.saleOrder.outlet = outlet;
    }

    function addPositionVolume(articleId, volume, price) {
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
