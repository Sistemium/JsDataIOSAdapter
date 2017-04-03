'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state) {

    const {Debt, Outlet} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({});

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    /*
     Functions
     */

    function getData(outletId) {

      return Debt.findAll({outletId})
        .then(data => _.filter(data, debt => debt.summ > 0))
        .then(data => {
          data = _.groupBy(data, 'date');
          vm.data = _.map(data, (items, date) => {
            return {date, items}
          });
        })
        .catch(e => console.error(e));

    }

  }

  angular.module('webPage')
    .controller('OutletDebtController', OutletDebtController);

}());
