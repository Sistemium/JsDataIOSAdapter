'use strict';

(function () {

  function CashingController(Schema, $scope, saControllerHelper, $state) {

    const {Cashing, Outlet} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        totalCashed,
        onStateChange,
        doUncashingClick,
        editClick,
        deleteCashingClick

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

    function doUncashingClick() {

    }

    function deleteCashingClick(cashing) {
      Cashing.destroy(cashing.id);
    }

    function editClick() {
      vm.editing = !vm.editing;
    }

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

      let data = _.groupBy(vm.uncashed, cashing => {

        if (!cashing.outletId) {
          return cashing.summ < 0 ? 'minus' : 'other';
        }

        return cashing.outletId;

      });

      data = _.map(data, (cashings, key) => {

        let outletId;
        let ord = 1;
        let title;

        if (key === 'minus') {
          ord = 3;
          title = 'Вычеты';
        } else if (key === 'other') {
          ord = 2;
          title = 'Прочая выручка';
        } else {
          outletId = key;
        }

        return {
          ord,
          key,
          title,
          cashings: _.orderBy(cashings, ['commentText', 'ndoc']),
          outlet: outletId && Outlet.get(outletId),
          totalSumm: _.sumBy(cashings, 'summ')
        };

      });

      vm.uncashedByOutlet = _.orderBy(data, ['ord', 'outlet.name', 'outlet.address']);

    }


  }

  angular.module('webPage')
    .controller('CashingController', CashingController);

}());
