'use strict';

(function (module) {

  module.component('debtView', {

    bindings: {
      customFilter: '<'
    },

    templateUrl: 'app/domain/sales/debts/debtView/debtView.html',

    controller: debtViewController,
    controllerAs: 'vm'

  });

  function debtViewController(Schema, $scope, saControllerHelper, $state, $q,
                              SalesmanAuth, localStorageService, saEtc, IOS) {

    const {Debt, Outlet, Cashing, Partner, Responsibility} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        responsibilities: Responsibility.getAll(),

        itemClick,
        onStateChange,
        totalCashedClick,
        restoreScrollPosition,
        responsibilityClick,

        totals: {}

      });

    const rootState = 'sales.debtByOutlet';

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, refresh);
    vm.onScope('rootClick', () => $state.go(rootState));
    vm.onScope('DebtOrCashingModified', () => vm.wasModified = true);

    // TODO: move scroll restore to a separate directive
    vm.onScope('$stateChangeStart', (event, next, nextParams, from) => {
      if (from.name === rootState) {
        saveScrollPosition();
      }
    });

    /*
     Functions
     */

    function responsibilityClick(responsibility) {
      responsibility.toggle();
      refresh();
    }

    function saveScrollPosition() {
      return localStorageService.set('debtByOutlet.scroll', _.get(getScrollerElement(), 'scrollTop'));
    }

    function getSavedScrollPosition() {
      return localStorageService.get('debtByOutlet.scroll') || 0;
    }

    function getScrollerElement() {
      return saEtc.getElementById('scroll-main');
    }

    function restoreScrollPosition() {
      scrollTo(getSavedScrollPosition());
    }

    function scrollTo(height) {

      let elem = getScrollerElement();

      if (!elem) {
        // console.warn('no scroller element');
        return;
      }

      if (height > elem.scrollHeight) {
        height = elem.scrollHeight;
      }

      elem.scrollTop = height;

    }

    function totalCashedClick() {
      $state.go('sales.cashing');
    }

    function onStateChange(to) {
      if (to.name === rootState && vm.wasModified && !vm.busy) {
        refresh();
      }
    }

    function refresh() {
      let filter = SalesmanAuth.makeFilter();
      vm.setBusy(getData(filter))
        .then(() => {
          vm.wasModified = false;
        });
    }

    function totalOverdue(data) {
      return _.sumBy(data || vm.data, 'overdue');
    }

    function totalCashed(data) {
      return _.sumBy(data || vm.data, 'sum(cashed)');
    }

    function totalSumm(data) {
      return _.sumBy(data || vm.data, 'sum(summ)');
    }

    function totalSummDoc(data) {
      return _.sumBy(data || vm.data, 'sum(summDoc)');
    }

    function itemClick(item) {
      let outletId = item.outletId;
      if (!outletId) return;
      $state.go('.outletDebt', {outletId});
    }

    function getData(filter) {

      const outletFilter = vm.customFilter ? { id: vm.customFilter } : Outlet.meta.salesmanFilter(filter);

      return Outlet.findAll(outletFilter, { limit: 10000 })
        .then(outlets => {

          let outletById = _.groupBy(outlets, 'id');

          let where = Responsibility.meta.jsdFilter();

          if (!where) return [];

          return Debt.groupBy({where}, ['outletId'])
            .then(debtsByOutlet => {
              return _.filter(debtsByOutlet, debt => outletById[debt.outletId]);
            });

        })
        .then(getOverdue)
        .then(data => $q.all(_.map(data, loadDebtRelations)))
        .then(data => _.filter(data, 'outlet'))
        .then(loadNotProcessed)
        .then(loadCashed)
        .then(groupByPartner)
        .catch(e => console.error(e));

    }

    function getOverdue(debtsByOutlet) {

      let responsibility = Responsibility.meta.jsdFilter();
      if (!responsibility) return debtsByOutlet;

      let where = _.assign({
        dateE: {'<=': moment().format()}
      }, responsibility);

      let filter = {where};

      if (!IOS.isIos()) {
        filter.isOverdue = true;
      }

      return Debt.groupBy(filter, ['outletId'])
        .then(overdueDebtsByOutlet => {
          _.each(overdueDebtsByOutlet, item => {

            let outletDebt = _.find(debtsByOutlet, {outletId: item.outletId});

            if (outletDebt) {
              outletDebt.overdue = item['sum(summ)'];
            }

          });

          return debtsByOutlet;

        });

    }

    function groupByPartner(data) {

      let byPartnerId = _.groupBy(data, 'outlet.partnerId');

      vm.data = _.map(byPartnerId, (items, partnerId) => {

        _.each(items, item => {

          item.summDocPlus = item['sum(summDoc)'] - item['sum(summ)'] - (item.notProcessed || 0);

        });

        return {
          id: partnerId,
          partner: Partner.get(partnerId),
          items: _.orderBy(items, 'outlet.name'),
          'sum(cashed)': totalCashed(items),
          'sum(summ)': totalSumm(items),
          'sum(summDoc)': totalSummDoc(items),
          overdue: totalOverdue(items)
        }

      });

      vm.data = _.orderBy(vm.data, 'partner.shortName');

      vm.totals = {
        totalCashed: totalCashed(),
        totalSumm: totalSumm(),
        totalSummDocPlus: totalSummDoc() - totalSumm(),
        totalOverdue: totalOverdue()
      };

    }

    function loadCashed(data) {

      return Cashing.groupBy(SalesmanAuth.makeFilter({uncashingId: null}), ['outletId'])
        .then(cashingsGrouped => {

          _.each(cashingsGrouped, outletCashings => {

            let {outletId} = outletCashings;
            let item = _.find(data, {outletId});

            if (!item) return;

            item['sum(cashed)'] = outletCashings['sum(summ)'];

          });

          return data;

        });

    }

    function loadNotProcessed(data) {

      return Cashing.findAll(SalesmanAuth.makeFilter({isProcessed: false}, {bypassCache: true}))

        .then(cashings => {
          cashings = _.filter(cashings, 'debtId');
          return _.groupBy(cashings, 'outletId');
        })

        .then(cashingGrouped => {

          _.each(cashingGrouped, (outletCashings, outletId) => {

            let item = _.find(data, {outletId});

            if (!item) return;

            let notProcessed = _.sumBy(outletCashings, 'summ');

            item.notProcessed = notProcessed;
            item['sum(summ)'] -= notProcessed;

          });

          return data;

        });

    }

    function loadDebtRelations(item) {

      if (!item.outletId) return $q.resolve();

      return Outlet.find(item.outletId)
        .then(outlet => {
          item.outlet = outlet;
          return outlet.DSLoadRelations('Partner');
        })
        .then(() => item)
        .catch(() => item.outlet = null);

    }

  }

})(angular.module('Sales'));
