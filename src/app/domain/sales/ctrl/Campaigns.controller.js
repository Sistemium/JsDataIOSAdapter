'use strict';

(function () {

  function CampaignsController(saControllerHelper, $scope, SalesmanAuth) {

    // const {Visit, Outlet} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {
      vm.selectedSalesmanId = _.get(salesman, 'id');
    });

    // $scope.$on('rootClick', () => $state.go('sales.visits'));

    /*
     Functions
     */

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
