'use strict';

(function () {

  function SaleOrderDetailsController(Schema, $scope, saControllerHelper, $state, $q) {

    const vm = saControllerHelper.setup(this, $scope);
    const {SaleOrderPosition, SaleOrder} = Schema.models();

    // TODO: consider weekends
    const nextWorkDay = moment().add(1, 'day').toDate();

    vm.use({

      saleOrderMinDate: nextWorkDay,
      saleOrderInitDate: nextWorkDay,

      toggleEditClick: () => vm.editing = !vm.editing,
      nextDayClick,
      prevDayClick

    });

    /*
     Init
     */

    vm.datepickerOptions = _.defaults({
      minDate: moment().add(1, 'day').toDate(),
      initDate: moment().add(1, 'day').toDate()
    }, $scope.datepickerOptions);

    vm.setBusy(getData());

    /*
     Listeners
     */

    SaleOrder.bindOne($state.params.id, $scope, 'vm.saleOrder');

    /*
     Functions
     */

    function nextDayClick() {
      vm.saleOrder.date = _.max([
        moment(vm.datepickerOptions.minDate),
        moment(vm.saleOrder.date).add(1, 'day')
      ]).toDate();
    }

    function prevDayClick() {
      vm.saleOrderDate = moment(vm.saleOrderDate).add(-1, 'day').toDate();
    }

    function getData() {

      return SaleOrder.find($state.params.id)
        .then(saleOrder => SaleOrder.loadRelations(saleOrder))
        .then(saleOrder => {
          return $q.all(_.map(saleOrder.positions, position => {
            SaleOrderPosition.loadRelations(position)
          }))
        })

    }

  }

  angular.module('webPage')
    .controller('SaleOrderDetailsController', SaleOrderDetailsController);

}());
