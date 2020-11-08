(function () {

  const URL = 'app/domain/sales/campaigns/campaignView';

  angular.module('Sales')
    .component('campaignView', {

      bindings: {
        campaign: '<',
        showPictures: '<',
      },

      templateUrl: `${URL}/campaignView.html`,
      controller: campaignViewController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function campaignViewController() {

    _.assign(this, {

      $onInit() {
        _.assign(this, {
          showPeriod: showPeriod(this.campaign),
        });
      },

    });

    function showPeriod(campaign) {
      return moment(campaign.dateE).add(1, 'day').date() !== 1
        || moment(campaign.dateB).date() !== 1;
    }

  }

})();
