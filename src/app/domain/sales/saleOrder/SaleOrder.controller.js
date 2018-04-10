'use strict';

(function () {

  function SaleOrderController(Schema, $scope, saControllerHelper, SalesmanAuth, $state, SaleOrderHelper) {

    let vm = saControllerHelper
      .setup(this, $scope)
      .use(SaleOrderHelper);

    let {SaleOrder, Outlet, SaleOrderPosition} = Schema.models();

    let eventsGroupedByDate;

    if (!$state.params.date) return setDate(SaleOrder.meta.nextShipmentDate());

    vm.use({

      data: [],

      date: $state.params.date ? $state.params.date : SaleOrder.meta.nextShipmentDate(),
      initDate: SaleOrder.meta.nextShipmentDate(),
      maxDate: moment().add(14, 'days').format(),

      itemClick,
      newItemClick,
      getDayClass

    });

    SalesmanAuth.watchCurrent($scope, getData);

    $scope.$on('$destroy', cleanup);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => $state.go('sales.saleOrders'));
    $scope.$watch('vm.date', _.debounce(setDate, 300));

    /*
     Handlers
     */

    /*
     Functions
     */

    function cleanup() {
      SaleOrderPosition.ejectAll();
    }

    function setDate(date) {
      $state.go('.', {date: date || vm.initDate});
    }

    function getData(salesman) {

      vm.currentSalesman = salesman;

      let date = vm.date;

      let filter = SalesmanAuth.makeFilter({date});

      let bySalesman = filter.salesmanId ? {
          'ANY outletSalesmanContracts': {
            'salesmanId': {
              '==': filter.salesmanId
            }
          }
        } : {};

      let saleOrderPositionsFilter = {
        date,
        where: {
          'ANY saleOrder': {
            date: {
              '==': date
            }
          }
        }
      };

      if (salesman) {
        saleOrderPositionsFilter.where['ANY saleOrder'].salesmanId = {'==': salesman.id};
      }

      vm.setBusy(
        [
          Outlet.findAll(_.assign({where: bySalesman}, _.omit(filter, 'date')))
            .then(SaleOrder.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])),
          SaleOrderPosition.findAll(saleOrderPositionsFilter),
          SaleOrder.groupBy(SalesmanAuth.makeFilter(), ['date', 'processing'])
            .then(res => eventsWithSaleOrderDays(res))
        ],
        'Загрузка данных дня'
      );

      vm.rebindAll(SaleOrder, filter, 'vm.data');

    }

    function itemClick(item) {
      $state.go('.item', {id: item.id});
    }

    function newItemClick() {
      $state.go('sales.catalogue.saleOrder');
    }

    function eventsWithSaleOrderDays(saleOrderDays) {

      // TODO: have to renew this at days and saleOrders change

      eventsGroupedByDate = _.groupBy(saleOrderDays, 'date');
      vm.minDate = moment(_.min(_.keys(eventsGroupedByDate))).toDate();

    }


    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let events = _.keyBy(eventsGroupedByDate[moment(date).format()], 'processing');
        if (!events) return;

        let draft = events['draft'];
        if (draft && draft['count()']) {
          return 'haveDraft';
        }

        if (moment(date).isSame(moment(), 'day')) {
          return 'today';
        }

        let counts = _.sumBy(_.values(events), 'count()');
        if (counts) return 'haveSaleOrder';

      }

    }

  }

  angular.module('webPage')
    .controller('SaleOrderController', SaleOrderController);

})();
