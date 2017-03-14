'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, Helpers, Schema, $q, SalesmanAuth, Sockets, DEBUG, IOS, $timeout) {

    const {SaleOrder, SaleOrderPosition, Outlet} = Schema.models('SaleOrder');
    const {saControllerHelper, ClickHelper, saEtc, toastr} = Helpers;

    const SUBSCRIPTIONS = ['SaleOrder', 'SaleOrderPosition'];

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    let saleOrderId = $state.params.saleOrderId;

    vm.use({

      kPlusButtonClick,
      bPlusButtonClick,
      searchOutletClick,
      clearSearchOutletClick,
      saleOrderDoneClick,
      saleOrderSaveDraftClick

    });

    if (saleOrderId) {

      vm.setBusy(
        SaleOrder.find(saleOrderId, {bypassCache: true})
          .then(() => SaleOrder.loadRelations(saleOrderId, 'Outlet'))
          .then(() => SaleOrder.loadRelations(saleOrderId, 'SaleOrderPosition', {bypassCache: true}))
          .then(saleOrder => $q.all(_.map(saleOrder.positions, pos => SaleOrderPosition.loadRelations(pos))))
          .catch(error => {
            console.error(error);
            if (error.error === 404) {
              toastr.error('Заказ не найден');
              $state.go('.', {saleOrderId: null});
            }
          })
      );

      vm.rebindOne(SaleOrder, saleOrderId, 'vm.saleOrder', () => {
        if (!vm.saleOrder) return;
        vm.saleOrderDate = moment(vm.saleOrder.date).toDate();
      });

    } else {

      vm.saleOrder = SaleOrder.createInstance({
        salesmanId: _.get(SalesmanAuth.getCurrentUser(), 'id'),
        date: moment().add(1, 'days').format()
      });

      // TODO: createInstance and setup with SalesmanAuth.getCurrentUser(), date: today()+1
    }

    $timeout().then(() => $scope.$parent.saleOrderExpanded = !saleOrderId);

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    vm.watchScope('vm.saleOrder.totalCost', _.debounce(onSaleOrderCostChange, 500));

    $scope.$watchGroup(['vm.saleOrder.outletId', 'vm.saleOrder.salesmanId'], onSaleOrderChange);

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
    $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));

    $scope.$on('$destroy', () => {
      SaleOrderPosition.ejectAll({saleOrderId: saleOrderId});
    });

    /*
     Handlers
     */

    function onSalesmanChange(salesman) {

      Outlet.findAll(Outlet.meta.salesmanFilter(SalesmanAuth.makeFilter()))
        .then(data => {
          vm.outlets = _.orderBy(data, 'name');
        });

      if (!vm.saleOrder) return;

      if (!vm.saleOrder.salesmanId || !vm.saleOrder.id) {
        vm.saleOrder.salesmanId = _.get(salesman, 'id');
      }

    }

    function saleOrderDoneClick() {
      $scope.$parent.saleOrderExpanded = false;
      let msg = `Заказ для "${vm.saleOrder.outlet.name}" отправлен в обработку`;
      $state.go('^')
        .then(() => {
          toastr.info(msg);
        });
    }

    function saleOrderSaveDraftClick() {
      $scope.$parent.saleOrderExpanded = false;
    }

    function onSaleOrderChange() {

      if (!vm.saleOrder) return;

      if (vm.saleOrder.isValid()) {

        let busy = SaleOrder.create(vm.saleOrder);

        if (!vm.saleOrderId) {
          busy
            .then(saleOrder => {
              $state.go('.', {saleOrderId: saleOrder.id}, {notify: false});
              vm.saleOrderId = saleOrder.id;
            })
            .catch(err => toastr.error(angular.toJson(err)));
        }

        vm.setBusy(busy);

      }

    }

    function onSaleOrderCostChange() {

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

    function onJSData(event) {

      DEBUG('onJSData', event);

      let id = _.get(event, 'data.id');

      if (!id) return;

      let {data, resource} = event;

      if (resource === 'SaleOrder') {

        if (SaleOrder.hasChanges(id)) {
          return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder');
        }

        if (data.deviceCts) {

          DEBUG('onJSData IOS injecting', resource);
          Schema.model(resource).inject(data);

        } else {

          SaleOrder.find(id, {bypassCache: true})
            .catch(err => {
              if (err.error ===404){
                SaleOrder.eject(saleOrderId)
              }
            });

        }

      } else if (resource === 'SaleOrderPosition') {

        if (data.saleOrderId === saleOrderId) {
          // IOS

          let position = getPosition(data.articleId);

          if (position && SaleOrderPosition.hasChanges(position)) {
            return DEBUG('CatalogueSaleOrder:onJSData', 'ignore position');
          }

          DEBUG('CatalogueSaleOrder:onJSData', 'inject position');

          return SaleOrderPosition.inject(data);

        } else if (!data.saleOrderId) {
          // not IOS
          return SaleOrderPosition.find(id, {bypassCache: true, cacheResponse: false})
            .then(updated => {
              if (updated.saleOrderId === saleOrderId) {
                let existing = getPosition(updated.articleId);
                if (existing && (SaleOrderPosition.hasChanges(existing) || updated.ts <= existing.ts)) {
                  DEBUG('Ignore SaleOrderPosition', updated.ts, existing.ts);
                } else {
                  SaleOrderPosition.inject(updated);
                }
              }
            });
        }

      }

    }

    function onJSDataDestroy(event) {

      DEBUG('onJSDataDestroy', event);
      let id = _.get(event, 'data.id');
      if (!id) return;

      if (SUBSCRIPTIONS.indexOf(event.resource) > -1) {
        Schema.model(event.resource).eject(id);
        if (id === saleOrderId) {
          toastr.error('Заказ удален');
          $state.go('^');
        }
      }

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

    function savePosition(position) {

      let options = {keepChanges: ['cost', 'volume']};

      if (position.volume > 0) {
        return SaleOrderPosition.unCachedSave(position, options);
      } else {
        return SaleOrderPosition.destroy(position);
      }

    }

    function getPosition(articleId) {
      return _.find(vm.saleOrder.positions, {articleId: articleId});
    }

    function addPositionVolume(articleId, volume, price) {

      let position = getPosition(articleId);

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

      // position.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      // console.warn(position.ts);

    }

  }

  angular.module('Sales')
    .controller('CatalogueSaleOrderController', CatalogueSaleOrderController);

})();
