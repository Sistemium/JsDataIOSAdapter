'use strict';

(function () {

  function DebtByOutletController(Schema, $scope, saControllerHelper, $state, $q, SalesmanAuth) {

    const vm = saControllerHelper
      .setup(this, $scope);

    const {Debt, Outlet} = Schema.models();

    vm.use({

      itemClick

    });

    SalesmanAuth.watchCurrent($scope, () => {
      let filter = SalesmanAuth.makeFilter();
      vm.setBusy(getData(filter));
    });

    /*
     Listeners
     */


    /*
     Functions
     */

    function itemClick(item) {
      let outletId = item.outletId;
      if (!outletId) return;
      $state.go('.', {outletId});
    }

    function getData(filter) {

      return Debt.groupBy(filter, ['outletId'])
        .then(data => {
          return $q.all(_.map(data, item => {
            if (!item.outletId) return $q.resolve();
            return Outlet.find(item.outletId)
              .then(outlet => {
                return Debt.findAll({outletId: outlet.id})
                  .then(debts => {
                    item.total = _.round(_.sumBy(debts, 'summ'),2);
                    return outlet;
                  })
              })
              .then(outlet => {
                item.outlet = outlet;
                return item;
              });
          }));
        })
        .then(data => vm.data = _.filter(data, 'outlet'))
        .catch(e => console.error(e));

    }

  }

  angular.module('webPage')
    .controller('DebtByOutletController', DebtByOutletController);

}());
