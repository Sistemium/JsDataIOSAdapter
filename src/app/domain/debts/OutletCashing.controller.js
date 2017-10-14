(function() {

  function OutletCashingController(Schema, $scope, saControllerHelper, $state, $timeout) {

    const {Cashing} = Schema.models();

    const {outletId} = $state.params;

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        editClick,
        deleteCashingClick
      });

    const orderBy = [['deviceCts', 'DESC']];

    vm.rebindAll(Cashing, {outletId, orderBy}, 'vm.data');

    refresh();

    /*
    Functions
     */

    function refresh() {
      return Cashing.findAllWithRelations({outletId}, {bypassCache: true})('Debt');
    }

    let timeout;

    function deleteCashingClick(cashing) {

      vm.confirmation = vm.confirmation !== cashing.id && cashing.id;

      if (vm.confirmation) {

        if (timeout) {
          $timeout.cancel(timeout);
        }

        timeout = $timeout(3000).then(() => {
          if (vm.confirmation === cashing.id) {
            vm.confirmation = false
          }
        });

      } else {
        cashing.DSDestroy();
      }


    }

    function editClick() {
      vm.editing = !vm.editing;
    }


  }

  angular.module('webPage')
    .controller('OutletCashingController', OutletCashingController);

})();
