(function () {

  const URL = 'app/domain/sales/campaigns/campaignView';

  angular.module('Sales')
    .component('campaignView', {

      bindings: {
        campaign: '<',
      },

      templateUrl: `${URL}/campaignView.html`,
      controller: campaignViewController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function campaignViewController() {

    _.assign(this, {

      $onInit() {
      },

    });


  }

})();
