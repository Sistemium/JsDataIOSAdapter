(function (module) {

  module.controller('PhotoReportListController', PhotoReportListController);

  function PhotoReportListController(Schema, Helpers, $scope, SalesmanAuth, GalleryHelper, Sockets, localStorageService) {

    const {PhotoReport, Outlet, Campaign, CampaignGroup} = Schema.models();
    const {saControllerHelper, toastr} = Helpers;

    const LOCAL_STORAGE_KEY = 'photoReportForm.defaults';

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        isPopoverOpen: false,
        campaignGroups: [],
        campaigns: [],
        outlets: [],

        addItemClick,
        thumbClick,
        deleteClick

      });

    SalesmanAuth.watchCurrent($scope, refresh);

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['PhotoReport']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    vm.onScope('rootClick', () => {
      vm.campaignId = null;
      vm.outletId = null;
    });

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'PhotoReport') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      PhotoReport.inject(data);

    }

    function deleteClick(picture) {
      PhotoReport.destroy(picture);
    }

    function thumbClick(picture) {

      vm.commentText = picture.campaign.name;
      $scope.imagesAll = vm.data;

      return vm.thumbnailClick(picture);

    }

    function addItemClick() {
      toastr.info('Добавить Фото-отчет');
    }

    function loadPhotoReports() {

      let filter = {orderBy: [['deviceCts', 'DESC']]};

      let {campaignId, outletId} = vm;

      if (vm.campaignId) {
        filter.campaignId = vm.campaignId;
      }

      if (vm.outletId) {
        filter.outletId = vm.outletId;
      }

      vm.rebindAll(PhotoReport, filter, 'vm.data');

      let q = PhotoReport.findAllWithRelations(filter, {bypassCache: true})(['Outlet']);

      vm.setBusy(q);

      if (campaignId && outletId) {
        vm.photoReport = PhotoReport.createInstance({campaignId, outletId})
      } else {
        vm.photoReport = null;
      }

    }

    let unWatchRefresh;

    function refresh() {

      let filter = SalesmanAuth.makeFilter();

      let q = [
        CampaignGroup.findAll(),
        Campaign.findAll(),
        Outlet.findAll(Outlet.meta.salesmanFilter(filter))
          .then(data => vm.outlets = data)
          .then(loadFiltersData)
      ];

      vm.setBusy(q);

      if (unWatchRefresh) {
        unWatchRefresh();
      }

      unWatchRefresh = $scope.$watchGroup(['vm.campaignId', 'vm.outletId', 'vm.campaignGroupId'], loadPhotoReports);

    }

    function loadFiltersData() {

      return CampaignGroup.findAll()
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

            if (!campaignGroupId) {
              vm.campaigns = [];
              return;
            }

            Campaign.findAll(Campaign.meta.filterByGroup(vm.campaignGroup))
              .then(campaigns => {

                vm.campaigns = campaigns;

                if (vm.campaignId && !_.find(campaigns, {id: vm.campaignId})) {
                  vm.campaignId = null;
                }

              });

          });

        });


    }

  }

})(angular.module('Sales'));
