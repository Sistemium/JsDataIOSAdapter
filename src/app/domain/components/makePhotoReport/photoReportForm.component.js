'use strict';

(function (module) {

  module.component('photoReportForm', {

    bindings: {
      onSubmitFn: '='
    },

    templateUrl: 'app/domain/components/makePhotoReport/photoReportForm.html',

    controller: photoReportFormController,
    controllerAs: 'vm'

  });

  function photoReportFormController(Schema, $scope, localStorageService, Sockets, SalesmanAuth, Helpers) {

    const {saControllerHelper, ClickHelper, moment} = Helpers;

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    _.assign(vm, {

      photoReport: null,

      $onInit,
      $onDestroy: saveDefaults,

      onSubmit,
      deletePhotoClick,
      chooseOutletClick,
      chooseCampaignClick,
      chooseCampaignGroupClick


    });

    const {PhotoReport, Outlet, Campaign, CampaignGroup} = Schema.models();

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    $scope.$watch('vm.photoReport.id', onSubmit);

    /*
     Functions
     */

    function chooseCampaignGroupClick(campaignGroup) {
      if (campaignGroup && campaignGroup.id !== vm.campaignGroupId) {
        vm.photoReport.campaignId = null;
        vm.campaignGroupId = campaignGroup.id;
      }
      vm.listShown = vm.showCampaignGroupList = !vm.showCampaignGroupList;
      saveDefaults();
    }

    function chooseCampaignClick(campaign) {
      if (campaign) {
        vm.photoReport.campaign = campaign;
      }
      vm.listShown = vm.showCampaignList = !vm.showCampaignList;
      saveDefaults();
    }

    function chooseOutletClick(outlet) {
      if (outlet) {
        vm.photoReport.outlet = outlet;
      }
      vm.listShown = vm.showOutletList = !vm.showOutletList;
      saveDefaults();
    }

    function onJSData(event) {

      if (event.resource !== 'PhotoReport') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      PhotoReport.inject(data);

    }

    function deletePhotoClick() {
      if (vm.photoReport.id) {
        PhotoReport.destroy(vm.photoReport)
          .then(() => {
            initEmpty();
          });
      }
    }


    function onSubmit() {

      let {photoReport} = vm;

      if (!photoReport.id) {
        return;
      }

      vm.onSubmitFn(photoReport);

      // _.assign(photoReport, {
      //   processing: 'upload'
      // });
      //
      // PhotoReport.save(photoReport)
      //   .then(saved => {
      //     if (_.isFunction(vm.onSubmitFn)) {
      //       vm.onSubmitFn(saved)
      //     }
      //   });
    }

    const DEFAULT_FIELDS = ['campaignId', 'outletId'];
    const LOCAL_STORAGE_KEY = 'photoReportForm.defaults';

    function saveDefaults() {

      localStorageService.set(LOCAL_STORAGE_KEY, _.pick(vm.photoReport, DEFAULT_FIELDS));
      localStorageService.set(`${LOCAL_STORAGE_KEY}.campaignGroupId`, vm.campaignGroupId);

    }

    function $onInit() {

      let filter = SalesmanAuth.makeFilter({});

      CampaignGroup.findAll()
        .then(groups => {

          vm.campaignGroups = _.filter(groups, campaignGroup => {
            return moment().isAfter(campaignGroup.dateB) && moment().add(-90, 'days').isBefore(campaignGroup.dateE);
          });

          vm.campaignGroupId = localStorageService.get(`${LOCAL_STORAGE_KEY}.campaignGroupId`);

          if (!vm.campaignGroupId) {
            let today = moment().format();
            vm.campaignGroupId = _.get(_.find(groups, group => group.dateB <= today && today <= group.dateE), 'id');
          }

          $scope.$watch('vm.campaignGroupId', campaignGroupId => {

            vm.campaignGroup = CampaignGroup.get(campaignGroupId);

            Campaign.findAll(Campaign.meta.filterByGroup(vm.campaignGroup))
              .then(campaigns => vm.campaigns = campaigns);

          });

        });

      Outlet.findAll(Outlet.meta.salesmanFilter(filter))
        .then(data => vm.outlets = data);

      if (!vm.id) {
        return initEmpty();
      }

      PhotoReport.find({id: vm.id}, {bypassCache: true})
        .then(photoReport => vm.photoReport = photoReport)
        .then(photoReport => PhotoReport.loadRelations(photoReport))
        .catch(err => {

          if (err.status === 404) {
            initEmpty();
          }

        });

    }

    function initEmpty() {
      let draft = PhotoReport.createInstance({
        processing: 'draft'
      });

      _.assign(draft, localStorageService.get(LOCAL_STORAGE_KEY));

      vm.photoReport = draft;
    }

  }

})(angular.module('Sales'));
