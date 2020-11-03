(function () {

  const URL = 'app/domain/sales/campaigns/campaignView';
  const CAMPAIGN_SHOW_PICTURES_KEY = 'showCampaignPictures';

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
  function campaignViewController(localStorageService) {

    _.assign(this, {

      $onInit() {

        const showPictures = localStorageService.get(CAMPAIGN_SHOW_PICTURES_KEY);
        _.assign(this, {
          showPictures: showPictures !== false,
          showPeriod: showPeriod(this.campaign),
        });
      },

      togglePicturesClick() {
        this.showPictures = !this.showPictures;
        localStorageService.set(CAMPAIGN_SHOW_PICTURES_KEY, this.showPictures)
      },

    });

    function showPeriod(campaign) {
      return moment(campaign.dateE).add(1, 'day').date() !== 1
        || moment(campaign.dateB).date() !== 1;
    }

  }

})();
