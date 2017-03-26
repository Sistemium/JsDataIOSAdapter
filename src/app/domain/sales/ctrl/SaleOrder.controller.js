'use strict';

(function () {

  function SaleOrderController(Schema, $scope, saControllerHelper, SalesmanAuth, $state) {

    let vm = saControllerHelper.setup(this, $scope);
    let {SaleOrder, Outlet, SaleOrderPosition} = Schema.models();

    let eventsGroupedByDate;

    let today = moment().toDate();
    today.setHours(0, 0, 0, 0);

    vm.use({

      data: [],

      date: $state.params.date,
      initDate: today,
      minDate: today,
      maxDate: moment().add(7, 'days').toDate(),

      itemClick,
      newItemClick,
      onStateChange,
      getDayClass

    });

    SalesmanAuth.watchCurrent($scope, getData);

    /*
     Listeners
     */

    $scope.$on('rootClick', () => $state.go('sales.saleOrders'));
    $scope.$watch('vm.date', _.debounce(setDate, 300));

    /*
     Handlers
     */

    function onStateChange(to) {
      if (!/sales.saleOrders/.test(to.name)) cleanup();
    }

    /*
     Functions
     */

    function cleanup() {
      SaleOrderPosition.ejectAll();
    }

    function setDate(newValue) {

      if (!newValue) {
        newValue = moment().format();
      }

      $state.go('.', {date: newValue});

    }

    function getData(salesman) {

      vm.currentSalesman = salesman;

      let date = moment(vm.date).format();

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
          SaleOrder.groupBy({filter}, ['date', 'processing'])
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

      eventsGroupedByDate = _.groupBy(saleOrderDays, 'date');
      vm.minDate = moment(_.min(_.keys(eventsGroupedByDate))).toDate();

    }


    function getDayClass(data) {

      let {date, mode} = data;

      if (mode === 'day') {

        let events = _.keyBy(eventsGroupedByDate[moment(date).format('YYYY-MM-DD')], 'processing');
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

}());
