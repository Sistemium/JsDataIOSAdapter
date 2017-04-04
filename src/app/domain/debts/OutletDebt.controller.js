'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state) {

    const {Debt, Outlet} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({totalSumm});

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    /*
     Functions
     */

    function getData(outletId) {

      return Debt.findAll({outletId})
        .then(data => vm.debts = _.filter(data, debt => debt.summ > 0))
        .then(data => {
          data = _.groupBy(data, 'date');
          vm.data = _.map(data, (items, date) => {
            return {date, items}
          });
        })
        .catch(e => console.error(e));

    }

    function totalSumm() {
      return _.sumBy(vm.debts, 'summ');
    }

  }

  angular.module('webPage')
    .controller('OutletDebtController', OutletDebtController);

}());
