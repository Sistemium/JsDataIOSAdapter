'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth) {

    const {Campaign/*, CampaignPicture*/} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaigns: []

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      findCampaigns();

    });

    // $scope.$on('rootClick', () => $state.go('sales.visits'));

    /*
     Functions
     */

    function findCampaigns() {

      vm.rebindAll(Campaign, SalesmanAuth.makeFilter(), 'vm.campaigns', () => {
        console.info('vm.campaigns', vm.campaigns);
      });

    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
