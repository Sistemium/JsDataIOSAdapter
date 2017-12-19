'use strict';

(function () {

  function CashingController(Schema, $scope, saControllerHelper, $state, Sockets, Auth, $q, $timeout) {

    const {Cashing, Outlet, Uncashing} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        uncashingId: null,
        wasModified: true,

        totalCashed,
        onStateChange,
        doUncashingClick,
        editClick,
        deleteCashingClick,
        cancelCurrentUncashingClick,
        outletClick,

        uncashingClick,
        onHandsClick,
        cashingClick,

        checking: {}

      });

    const rootState = 'sales.cashing';

    /*
     Listeners
     */


    $scope.$on('$destroy', Sockets.jsDataSubscribe(['UncashingPicture']));

    vm.onScope('rootClick', () => $state.go(rootState));
    vm.onScope('DebtOrCashingModified', () => vm.wasModified = true);

    vm.watchScope('vm.uncashing', () => {

      let uncashing = vm.uncashing;

      let targetState = rootState + (uncashing ? '.uncashing' : '');

      if (vm.uncashingId) return;

      if ($state.current.name !== targetState) {
        $state.go(targetState);
      }

    });

    findUncashings();

    /*
     Functions
     */

    function cancelCurrentUncashingClick() {

      if (!vm.confirmCancelCurrentUncashing) {
        vm.confirmCancelCurrentUncashing = true;
        return $timeout(2000)
          .then(() => vm.confirmCancelCurrentUncashing = false);
      }

      let busy = $q.all(_.map(vm.currentUncashing.cashings, cashing => {
        cashing.uncashingId = null;
        return cashing.DSCreate();
      }));

      return busy.then(() => {
        vm.currentUncashing.DSDestroy();
      })
        .then(() => {
          $state.go(rootState);
        });

    }

    function onHandsClick() {
      $state.go(rootState);
    }

    function cashingClick(cashing) {
      vm.checking[cashing.id] = !vm.checking[cashing.id];
      fillToUncashData();
    }

    function uncashingClick(uncashing) {
      if (uncashing) {
        $state.go(`${rootState}.uncashed`, {uncashingId: uncashing.id});
      }
    }

    function outletClick(outlet) {
      if (outlet) {
        $state.go('sales.debtByOutlet.outletDebt', {outletId: outlet.id})
      }
    }

    function doUncashingClick() {

    }

    function deleteCashingClick(cashing) {
      Cashing.destroy(cashing.id);
    }

    function editClick() {
      vm.editing = !vm.editing;
    }

    function onStateChange(to, params) {

      let uncashingId = params.uncashingId || null;

      if (uncashingId !== vm.uncashingId) {
        vm.wasModified = true;
      }

      vm.isUncashingPopoverOpen = false;
      vm.editing = false;
      vm.uncashing = to.name === `${rootState}.uncashing`;
      vm.uncashingId = uncashingId;

      vm.rebindOne(Uncashing, uncashingId, 'vm.currentUncashing');

      if (vm.wasModified) {
        refresh();
      }

    }


    function refresh() {
      vm.setBusy(getData())
        .then(() => {
          vm.wasModified = false;
        });
    }


    function totalCashed() {
      return vm.totalOnHands;
    }

    function findUncashings() {

      let filter = {authId: Auth.authId()};
      let where = {
        processing: {
          '!=': 'draft'
        },
        authId: {
          '==': filter.authId
        }
      };

      let orderBy = [['date', 'DESC'], ['deviceCts', 'DESC']];

      vm.rebindAll(Uncashing, {where, orderBy}, 'vm.uncashings');

      return Uncashing.findAll(filter);

    }


    function getData() {

      let filter = {uncashingId: vm.uncashingId};

      return Cashing.findAllWithRelations(filter, {bypassCache: true})()
        .then(() => {
          vm.rebindAll(Cashing, filter, 'vm.uncashed', groupCashingsByOutlet);
        })
        .catch(e => console.error(e));

    }

    function fillToUncashData() {
      vm.toUncash = _.filter(vm.uncashed, cashing => vm.checking[cashing.id]);
      vm.totalChecked = _.sumBy(vm.toUncash, 'summ');
    }


    function groupCashingsByOutlet() {

      vm.checking = {};

      _.each(vm.uncashed, cashing => vm.checking[cashing.id] = true);

      fillToUncashData();

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

      if (!vm.uncashingId) {
        vm.totalOnHands = _.sumBy(vm.uncashed, 'summ');
      }

    }


  }

  angular.module('webPage')
    .controller('CashingController', CashingController);

})();
