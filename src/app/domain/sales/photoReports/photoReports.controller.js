'use strict';

(function () {

  const REQUIRED_ACCURACY = 150;

  function PhotoReportsController(Schema, Helpers, $scope, SalesmanAuth, $state, GalleryHelper, ConfirmModal, $q, Sockets) {

    const {Partner, Campaign, Outlet, PhotoReport, Location} = Schema.models();
    const {saMedia, saControllerHelper, PhotoHelper, LocationHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        selectedOutletId: $state.params.outletId,
        selectedCampaignId: $state.params.campaignId,
        initGroupId: $state.params.campaignGroupId,
        outletPhotoReports: {},
        currentPhotoReports: [],

        takePhoto,
        outletClick,
        campaignClick,
        thumbClick,
        rowHeight

      });

    vm.onScope('rootClick', () => $state.go('.', {outletId: null, campaignId: null}));

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['PhotoReport']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', {campaignGroupId}, {notify: false});
      vm.setBusy(loadCampaigns(campaignGroupId));

    });

    if (!vm.selectedOutletId) {

      loadOutlets();

    } else if (!vm.selectedCampaignId) {

      loadOutlet(vm.selectedOutletId);
      loadCampaigns(vm.initGroupId);

    } else  {

      loadOutlet(vm.selectedOutletId);
      loadCampaign(vm.selectedCampaignId);

      let filter = {
        outletId  : vm.selectedOutletId,
        campaignId: vm.selectedCampaignId,
        salesmanId: SalesmanAuth.getCurrentUser().id
      };

      vm.rebindAll(PhotoReport, filter, 'vm.currentPhotoReports');

    }

    function onJSData(event) {

      // FIXME: works only under IOS

      if (event.resource !== 'PhotoReport') return;

      if (!_.get(event, 'data.href')) return;

      if (!vm.selectedOutletId) return;

      let photoReportOk = (event.data.salesmanId === SalesmanAuth.getCurrentUser().id && event.data.outletId === vm.selectedOutletId);

      if (photoReportOk && vm.selectedCampaignId) {
        photoReportOk = (event.data.campaignId === vm.selectedCampaignId);
      }

      if (photoReportOk) {
        PhotoReport.inject(event.data);
      }

    }

    function loadOutlets() {

      let filter = SalesmanAuth.makeFilter();

      return Partner.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])
        .then(partners => vm.partners = partners);

    }

    function loadOutlet(outletId) {

      Outlet.find(outletId)
        .then(outlet => vm.outlet = outlet);

    }

    function loadCampaigns(campaignGroupId) {

      if (!campaignGroupId) return;

      return Campaign.findAll({campaignGroupId})
        .then(campaigns => {

          vm.campaigns = campaigns;
          loadPhotoReports();

        });

    }

    function loadPhotoReports() {

      _.forEach(vm.campaigns, campaign => {
        photoReportsForCampaign(campaign.id);
      });

    }

    function loadCampaign(campaignId) {

      Campaign.find(campaignId)
        .then(campaign => vm.campaign = campaign)
        .then(photoReportsForCampaign(campaignId));

    }

    function photoReportsForCampaign(campaignId) {

      let filter = {
        outletId  : vm.selectedOutletId,
        campaignId: campaignId,
        salesmanId: SalesmanAuth.getCurrentUser().id
      };

      PhotoReport.findAll(filter, {bypassCache: true})
        .then(photoReports => {
          vm.outletPhotoReports[campaignId] = photoReports;
        });

    }

    function takePhoto() {

      vm.busy = checkin();

      vm.busy.then(() => {

          let photoReportData = {
            outletId  : vm.selectedOutletId,
            campaignId: vm.selectedCampaignId,
            salesmanId: SalesmanAuth.getCurrentUser().id,
            locationId: vm.currentLocation.id
          };

          return PhotoHelper.makePhoto('PhotoReport', photoReportData);

        });

    }

    function checkin() {

      if (vm.currentLocation) return $q.resolve();

      return getLocation()
        .then(location => {
          vm.currentLocation = location;
        })
        .catch(err => {
          return ConfirmModal.showMessageAskRepeat(err, checkin, $q.reject());
        });

    }

    function outletClick(outlet) {
      $state.go('.', {outletId: outlet.id, campaignId: null});
    }

    function campaignClick(campaign) {
      $state.go('.', {outletId: vm.selectedOutletId, campaignId: campaign.id});
    }

    function thumbClick(picture) {

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      return vm.thumbnailClick(picture);

    }

    function rowHeight(partner) {

      let xsMargin = (saMedia.xsWidth || saMedia.xxsWidth) ? 21 : 0;
      return 39 + partner.outlets.length * 29 + 8 + 17 - xsMargin;

    }

    function getLocation() {
// TODO: copypaste from VisitCreateController may be move it in separate service

      vm.locating = true;
      vm.busyMessage = 'Получение геопозиции…';

      return LocationHelper.getLocation(REQUIRED_ACCURACY, undefined, 'PhotoReport')
        .then(location => {

          vm.locating = false;

          if (location.horizontalAccuracy <= REQUIRED_ACCURACY) {

            return Location.inject(location);

          } else {

            let message = 'Требуемая точность — ' + REQUIRED_ACCURACY + 'м. ';
            message += 'Достигнутая точность — ' + location.horizontalAccuracy + 'м.';
            return ConfirmModal.showMessageAskRepeat(message, getLocation, $q.reject());

          }

        });

    }

  }

  angular.module('webPage')
    .controller('PhotoReportsController', PhotoReportsController);

})();
