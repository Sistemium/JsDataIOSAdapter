'use strict';

(function () {

  function CatalogueSaleOrderController($scope, $state, Helpers, Schema, $q,
                                        SalesmanAuth, SaleOrderHelper, $timeout, DomainOption) {

    const {SaleOrder, SaleOrderPosition, Outlet} = Schema.models('SaleOrder');
    const {saControllerHelper, ClickHelper, saEtc, toastr} = Helpers;

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper)
      .use(SaleOrderHelper);

    let {saleOrderId, outletId, salesmanId} = $state.params;

    vm.use({

      noFactor: !DomainOption.hasArticleFactors(),
      searchOutletClick,
      clearSearchOutletClick,
      saleOrderSaveDraftClick,
      minusButtonClick,
      lastPlus: {},
      outletClick,
      saleOrderClick

    });

    if (saleOrderId) {

      // SaleOrder.watchChanges = true;

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
        outletId,
        salesmanId: salesmanId || _.get(SalesmanAuth.getCurrentUser(), 'id'),
        date: moment().add(1, 'days').format(),
        processing: 'draft'
      });

    }

    $timeout().then(() => $scope.$parent.saleOrderExpanded = !saleOrderId);

    /*
     Listeners
     */

    bindToChanges();

    SalesmanAuth.watchCurrent($scope, onSalesmanChange);

    // vm.watchScope('vm.saleOrder.totalCost', _.debounce(onSaleOrderCostChange, 500));

    $scope.$on('$destroy', () => {
      // SaleOrder.watchChanges = false;
      SaleOrderPosition.ejectAll({saleOrderId: saleOrderId});
    });

    vm.onScope('kPlusButtonClick', kPlusButtonClick);
    vm.onScope('bPlusButtonClick', bPlusButtonClick);

    vm.watchScope('vm.saleOrder.outlet.partner.allowAnyVolume', () => {
      vm.noFactor = _.get(vm.saleOrder, 'outlet.partner.allowAnyVolume') || !DomainOption.hasArticleFactors();
    });

    vm.watchScope('vm.saleOrder.outletId', onOutletChange);

    /*
     Handlers
     */

    function onOutletChange() {

      if (!vm.saleOrder) {
        vm.lastSaleOrderId = false;
        return;
      }

      if (vm.saleOrder.id !== vm.lastSaleOrderId) {
        vm.lastSaleOrderId = vm.saleOrder.id;
        return;
      }

      let commentText = _.get(vm.saleOrder, 'outlet.saleOrderComment') || null;

      vm.saleOrder.commentText = commentText;

    }

    function saleOrderClick() {
      if (vm.isSaleOrderPopoverOpen) {
        return;
      }

      let filter = SalesmanAuth.makeFilter({processing: 'draft'});

      vm.saleOrderBusy = SaleOrder.findAllWithRelations(filter)('Outlet');

    }

    function outletClick() {

      // vm.isSaleOrderPopoverOpen = !vm.isSaleOrderPopoverOpen;

      if (!vm.outlets) {

        let filter = Outlet.meta.salesmanFilter(SalesmanAuth.makeFilter());

        vm.outletBusy = Outlet.findAll(filter)
          .then(data => {
            vm.outlets = _.orderBy(data, 'name');
          });

      }

    }

    function onSalesmanChange(salesman) {

      if (!vm.saleOrder) return;

      if (!vm.saleOrder.salesmanId || !vm.saleOrder.id) {
        vm.saleOrder.salesmanId = _.get(salesman, 'id');
      }

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
            $scope.$emit('setSaleOrderId', saleOrder.id);
          }
        });

      return vm.setBusy(busy)
        .catch(e => {
          console.error(e);
          toastr.error('Ошибка сохранения заказа');
        });

    }

    function clearSearchOutletClick(id) {
      vm.search = '';
      saEtc.focusElementById(id);
    }

    function minusButtonClick(article) {

      let minus = vm.lastPlus[article.id];

      if (!minus) {
        minus = 1;
        let {id, packageRel} = article;
        let position = getPosition(id);
        if (position.volume % packageRel === 0) {
          minus = packageRel;
        }
        vm.lastPlus[id] = minus;
      }

      addPositionVolume(article.id, -minus);

    }

    function kPlusButtonClick(event, article, price) {
      vm.lastPlus[article.id] = article.packageRel;
      addPositionVolume(article.id, article.packageRel, price);
    }

    function bPlusButtonClick(event, article, price) {
      vm.lastPlus[article.id] = 1;
      addPositionVolume(article.id, 1, price);
    }

    function searchOutletClick(outlet) {
      vm.saleOrder.outlet = outlet;
      vm.isOutletPopoverOpen = false;
    }

    /*
     Functions
     */

    let unbindToChanges;
    const requiredColumns = ['outletId', 'salesmanId', 'date', 'contractId', 'priceTypeId'];

    if (_.get(DomainOption.saleOrderOptions(), 'schemaOption')) {
      requiredColumns.push('salesSchema');
      // vm.saleOrder.salesSchema = vm.saleOrder.salesSchema || 1;
    }

    function bindToChanges() {

      if (saleOrderId) {

        if (unbindToChanges) unbindToChanges();

        vm.rebindOne(SaleOrder, saleOrderId, 'vm.saleOrder', saEtc.debounce(() => {
          if (!vm.saleOrder || !vm.saleOrder.id) return;
          if (SaleOrder.hasChanges(vm.saleOrder.id)) onSaleOrderChange();
        }, 700, $scope));

      } else {
        unbindToChanges = $scope.$watch(() => _.pick(vm.saleOrder, requiredColumns), onSaleOrderChange, true);
      }
    }

    function getPosition(articleId) {
      return _.find(vm.saleOrder.positions, {articleId: articleId});
    }

    function addPositionVolume(articleId, volume, price) {

      let position = getPosition(articleId);

      if (!position && volume <= 0) {
        return;
      }

      if (!position) {
        // FIXME: duplicated with code in quantityEdit
        position = SaleOrderPosition.createInstance({
          saleOrderId: vm.saleOrder.id,
          volume: 0,
          price: price.discountPrice(),
          priceDoc: price.priceOrigin(),
          priceOrigin: price.priceOrigin(),
          priceAgent: price.priceAgent,
          articleId: articleId
        });
        SaleOrderPosition.inject(position);
      }

      position.volume = _.max([position.volume + volume, 0]);

      let factor = !vm.noFactor && _.get(position, 'article.factor') || 1;
      let notFactored = position.volume % factor;

      if (notFactored) {
        position.volume = position.volume - notFactored + (volume > 0 ? factor : 0);
      }

      // console.info('addPositionVolume:', position.volume);

      position.updateCost();
      vm.saleOrder.updateTotalCost();

      // console.info('addPositionVolume totalCost:', vm.saleOrder.totalCost);

      // position.ts = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      // console.warn(position.ts);

    }

  }

  angular.module('Sales')
    .controller('CatalogueSaleOrderController', CatalogueSaleOrderController);

})();
