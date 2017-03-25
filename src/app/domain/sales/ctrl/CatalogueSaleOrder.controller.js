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

      searchOutletClick,
      clearSearchOutletClick,
      saleOrderDoneClick,
      saleOrderSaveDraftClick,
      setProcessingClick

    });

    if (saleOrderId) {

      vm.setBusy(
        SaleOrder.find(saleOrderId, {bypassCache: true})
          .then(() => SaleOrder.loadRelations(saleOrderId, ['Outlet', 'Contract']))
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

    } else {

      vm.saleOrder = SaleOrder.createInstance({
        salesmanId: _.get(SalesmanAuth.getCurrentUser(), 'id'),
        date: moment().add(1, 'days').format()
      });

    }

    $timeout().then(() => $scope.$parent.saleOrderExpanded = !saleOrderId);

    /*
     Listeners
     */

    bindToChanges();

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    // vm.watchScope('vm.saleOrder.totalCost', _.debounce(onSaleOrderCostChange, 500));

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
    $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));

    $scope.$on('$destroy', () => {
      SaleOrderPosition.ejectAll({saleOrderId: saleOrderId});
    });

    vm.onScope('kPlusButtonClick', kPlusButtonClick);
    vm.onScope('bPlusButtonClick', bPlusButtonClick);

    vm.watchScope('vm.saleOrder.processingMessage', processingMessage => {
      if (!processingMessage) return;
      toastr.error(processingMessage);
    });

    /*
     Handlers
     */

    // FIXME: copy-pasted from SaleOrderDetails.controller

    function setProcessingClick(processing) {

      vm.saleOrder.processing = processing;
      vm.saleOrder.DSCreate()
        .then(saleOrder => {
          let {desc, label} = _.result(saleOrder, 'workflow');
          toastr.info(desc, `Статус заказа: ${label}`);
          $scope.$parent.saleOrderExpanded = false;
        })
        .catch(e => toastr.info(angular.toJson(e), 'Ошибка сохранения'));

    }

    function onSalesmanChange(salesman) {

      let filter = Outlet.meta.salesmanFilter(SalesmanAuth.makeFilter());

      Outlet.findAll(filter)
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

      if (!vm.saleOrder || !vm.saleOrder.isValid()) return;

      let busy = vm.saleOrder.safeSave()
        .then(saleOrder => {
          if (!saleOrderId) {
            $state.go('.', {saleOrderId: saleOrder.id}, {notify: false});
            saleOrderId = saleOrder.id;
            bindToChanges();
            $scope.$emit('setSaleOrder', saleOrder);
          }
        });

      return vm.setBusy(busy)
        .catch(e => {
          console.error(e);
          toastr.error('Ошибка сохранения заказа');
        });

    }

    function onJSData(event) {

      let id = _.get(event, 'data.id');

      if (!id) return;

      let {data, resource} = event;

      if (resource === 'SaleOrder') {

        DEBUG('onJSData SaleOrder', event);

        if (SaleOrder.hasChanges(id)) {
          return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder');
        }

        if (data.deviceCts) {

          DEBUG('onJSData IOS injecting', resource);
          Schema.model(resource).inject(data);

        } else {

          SaleOrder.find(id, {bypassCache: true})
            .catch(err => {
              if (err.error === 404) {
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

    function kPlusButtonClick(event, article, price) {
      addPositionVolume(article.id, article.packageRel, price);
    }

    function bPlusButtonClick(event, article, price) {
      addPositionVolume(article.id, 1, price);
    }

    function searchOutletClick(outlet) {
      vm.saleOrder.outlet = outlet;
      vm.isOpenOutletPopover = false;
    }

    /*
     Functions
     */

    let unbindToChanges;
    const requiredColumns = ['outletId', 'salesmanId', 'date', 'contractId', 'priceTypeId'];

    function bindToChanges() {
      if (saleOrderId) {

        if (unbindToChanges) unbindToChanges();

        vm.rebindOne(SaleOrder, saleOrderId, 'vm.saleOrder', _.debounce(() => {
          if (!vm.saleOrder) return;
          if (SaleOrder.hasChanges(vm.saleOrder.id)) onSaleOrderChange();
        }, 700));

      } else {
        unbindToChanges = $scope.$watch(() => _.pick(vm.saleOrder, requiredColumns), onSaleOrderChange, true);
      }
    }

    function getPosition(articleId) {
      return _.find(vm.saleOrder.positions, {articleId: articleId});
    }

    function addPositionVolume(articleId, volume, price) {

      let position = getPosition(articleId);

      if (!position) {
        // FIXME: duplicated with code in quantityEdit
        position = SaleOrderPosition.createInstance({
          saleOrderId: vm.saleOrder.id,
          volume: 0,
          price: price.price,
          priceDoc: price.price,
          priceOrigin: price.priceOrigin,
          articleId: articleId
        });
        vm.saleOrder.totalCost = 0;
        SaleOrderPosition.inject(position);
      }

      position.volume += volume;

      let factor = _.get(position, 'article.factor') || 1;
      let notFactored = position.volume % factor;

      if (notFactored) {
        position.volume = position.volume - notFactored + (volume > 0 ? factor : 0);
      }

      position.updateCost();
      vm.saleOrder.updateTotalCost();

      // position.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      // console.warn(position.ts);

    }

  }

  angular.module('Sales')
    .controller('CatalogueSaleOrderController', CatalogueSaleOrderController);

})();
