'use strict';

(function () {

  function CashingController(Schema, $scope, saControllerHelper, $state) {

    const {Cashing, Outlet} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        totalCashed,
        onStateChange

      });

    const rootState = 'sales.cashing';

    /*
     Listeners
     */

    vm.onScope('rootClick', () => $state.go(rootState));
    vm.onScope('DebtOrCashingModified', () => vm.wasModified = true);

    refresh();

    /*
     Functions
     */

    function onStateChange(to) {
      if (to.name === rootState && vm.wasModified) {
        refresh();
      }
    }

    function refresh() {
      vm.setBusy(getData())
        .then(() => vm.wasModified = false);
    }

    function totalCashed() {
      return _.sumBy(vm.uncashed, 'summ');
    }


    function getData() {

      let filter = {uncashingId: null};

      return Cashing.findAllWithRelations(filter, {bypassCache: true})()
        .then(() => {
          vm.rebindAll(Cashing, filter, 'vm.uncashed', groupCashingsByOutlet);
        })
        .catch(e => console.error(e));

    }

    function groupCashingsByOutlet() {

      let data = _.groupBy(vm.uncashed, 'outletId');

      data = _.map(data, (cashings, outletId) => {
        return {
          outletId,
          cashings: _.orderBy(cashings, ['ndoc']),
          outlet: Outlet.get(outletId),
          totalSumm: _.sumBy(cashings, 'summ')
        }
      });

      vm.uncashedByOutlet = _.orderBy(data, ['outlet.name', 'outlet.address']);

    }

  }

  angular.module('webPage')
    .controller('CashingController', CashingController);

}());
