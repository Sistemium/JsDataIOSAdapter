'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, Helpers, Schema, $q, SalesmanAuth) {

    const {SaleOrder, SaleOrderPosition, Outlet} = Schema.models('SaleOrder');
    const {saControllerHelper, ClickHelper, saEtc, toastr} = Helpers;

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let saleOrderId = $state.params.saleOrderId;

    vm.use({

      kPlusButtonClick,
      bPlusButtonClick,
      searchOutletClick,
      clearSearchOutletClick,
      saveOrder

    });

    if (saleOrderId) {
      SaleOrder.find(saleOrderId)
        .then(saleOrder => SaleOrder.loadRelations(saleOrder, 'SaleOrderPosition'))
        .then(saleOrder => $q.all(_.map(saleOrder.positions, pos => SaleOrderPosition.loadRelations(pos))))
        .catch(error => console.error(error));
    } else {

      vm.saleOrder = SaleOrder.inject({
        salesmanId: _.get(SalesmanAuth.getCurrentUser(), 'id'),
        date: moment().add(1, 'days').format('YYYY-MM-DD')
      });

      // TODO: createInstance and setup with SalesmanAuth.getCurrentUser(), date: today()+1
    }

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, () => {
      Outlet.findAll(Outlet.meta.salesmanFilter(SalesmanAuth.makeFilter()));
      let filter = {
        orderBy: ['name']
      };
      vm.rebindAll(Outlet, filter, 'vm.outlets');
    });

    vm.rebindOne(SaleOrder, saleOrderId, 'vm.saleOrder');
    vm.watchScope('vm.saleOrder.totalCost', _.debounce(onSaleOrderChange, 500));

    /*
     Handlers
     */

    function onSaleOrderChange() {

      if (!vm.saleOrder) return;

      let positions = _.filter(vm.saleOrder.positions, SaleOrderPosition.hasChanges);

      if (!positions.length) return;

      $q.all(_.map(positions, savePosition))
        .then(() => SaleOrder.unCachedSave(vm.saleOrder, {keepChanges: ['totalCost']}))
        .catch(e => {
          console.error(e);
          toastr.error('Ошибка сохранения заказа!');
          _.each(positions, SaleOrderPosition.revert);
          SaleOrder.revert(vm.saleOrder);
        });

    }

    function clearSearchOutletClick(id) {
      vm.search = '';
      saEtc.focusElementById(id);
    }

    function kPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, data.stock.article.packageRel, data.price);
    }

    function bPlusButtonClick(data) {
      addPositionVolume(data.stock.articleId, 1, data.price);
    }

    function searchOutletClick(outlet) {
      vm.saleOrder.outlet = outlet;
      vm.isOpenOutletPopover = false;
    }

    /*
     Functions
     */

    function saveOrder() {
      SaleOrder.create(vm.saleOrder)
        .then(() => $q.all(
          _.map(vm.saleOrder.positions, position => SaleOrderPosition.create(position))
        ))
        .catch(e => console.error(e));
    }

    function savePosition(position) {

      let options = {keepChanges: ['cost', 'volume']};

      if (position.volume > 0) {
        return SaleOrderPosition.unCachedSave(position, options);
      } else {
        return SaleOrderPosition.destroy(position);
      }

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
        vm.saleOrder.totalCost = 0;
        SaleOrderPosition.inject(position);
      }

      position.volume += volume;

      position.updateCost();
      vm.saleOrder.updateTotalCost();

    }

  }

  angular.module('webPage')
    .controller('CatalogueSaleOrderController', CatalogueSaleOrderController);

})();
