'use strict';

(function () {

  function salesmanMenuController(saControllerHelper, $scope, SalesmanAuth, saMedia, $state) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      salesmen: null,
      isEnabled: false,
      isOpen: false,
      noneClick: SalesmanAuth.logout,

      salesmanClick,
      toggleLabel,
      onStateChange,
      isDisabled

    });

    SalesmanAuth
      .bindAll($scope, 'vm.salesmen', onDataChange)
      .watchCurrent($scope, salesman => vm.selectedSalesman = salesman);

    let stateDisabled;

    onStateChange($state.current);

    /*
     Functions
     */

    function isDisabled() {
      return !vm.isEnabled || stateDisabled;
    }

    function onStateChange(toState) {
      stateDisabled = _.get(toState, 'data.disableSalesmanFilter');
      vm.isHidden = !!_.get(toState, 'data.hideSalesmanFilter');
    }

    function toggleLabel() {
      if (vm.selectedSalesman) {
        return saMedia.xxsWidth ? vm.selectedSalesman.initials : vm.selectedSalesman.tinyName;
      }
      return saMedia.xxsWidth ? false : 'Выберите ТП';
    }

    function salesmanClick(salesman) {

      vm.isOpen = false;

      if (!salesman || _.get(vm, 'selectedSalesman.id') === salesman.id) {
        return SalesmanAuth.logout();
      }

      SalesmanAuth.login(salesman);

    }

    function onDataChange(e, data) {
      vm.isEnabled = _.get(data, 'length') > 1;
      vm.hasOptions = _.get(data, 'length') > 1;
    }

  }

  angular.module('webPage')
    .controller('SalesmanMenuController', salesmanMenuController);

})();
