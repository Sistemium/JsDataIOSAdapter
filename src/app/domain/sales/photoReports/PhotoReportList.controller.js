(function (module) {

  module.controller('PhotoReportListController', PhotoReportListController);

  function PhotoReportListController(Schema, Helpers, $scope,
                                     SalesmanAuth, GalleryHelper, Sockets,
                                     PhotoReporting, localStorageService, moment) {

    const {PhotoReport, Outlet, Campaign, CampaignGroup} = Schema.models();
    const {saControllerHelper, toastr} = Helpers;

    const LOCAL_STORAGE_KEY = 'photoReportForm.defaults';
    const DEFAULT_FIELDS = ['campaignId', 'outletId', 'campaignGroupId'];

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        isPopoverOpen: false,
        campaignGroups: [],
        campaigns: [],
        outlets: [],

        addItemClick,
        thumbClick,
        deleteClick,

        $onInit,

        photoReportClick(photoReport) {
          PhotoReporting.showEdit(photoReport, this.campaignGroup);
        },

        hasWarning(photoReport) {
          return !photoReport.thumbnailHref;
        }

      });

    SalesmanAuth.watchCurrent($scope, refresh);

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['PhotoReport']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    vm.onScope('rootClick', () => {
      vm.campaignId = null;
      vm.outletId = null;
    });

    vm.watchScope('vm.busySavingPhoto', onBusySavingPhoto);

    /*
     Functions
     */

    function $onInit() {

      _.assign(vm, localStorageService.get(LOCAL_STORAGE_KEY));

    }

    function saveDefaults() {

      localStorageService.set(LOCAL_STORAGE_KEY, _.pick(vm, DEFAULT_FIELDS));

    }

    function onJSData(event) {

      if (event.resource !== 'PhotoReport') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      PhotoReport.inject(data);

    }

    function onBusySavingPhoto(promise) {
      if (promise && promise.then) {
        vm.cgBusy = {promise, message: 'Сохранение фото'};
        promise.then(createDraft);
      }
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

      let where = {};

      if (campaignId) {
        filter.campaignId = campaignId;
      } else {
        where.campaignId = {
          in: _.map(vm.allCampaigns, 'id')
        };
      }

      if (outletId) {
        filter.outletId = outletId;
      }

      saveDefaults();

      let q = PhotoReport.findAll(filter, {bypassCache: true})
        .then(loadPhotoReportsRelations)
        .then(() => {
          vm.rebindAll(PhotoReport, _.assign({where}, filter), 'vm.data');
        });

      createDraft();

      vm.setBusy(q);

    }

    function loadPhotoReportsRelations(photoReports) {

      const outletIds = _.filter(_.map(photoReports, v => !v.outlet && v.outletId));
      return Outlet.findByMany(outletIds);

    }

    function createDraft() {

      let {campaignId, outletId} = vm;

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
        loadCampaignGroup(),
        Campaign.findAll(),
        Outlet.findAll(Outlet.meta.salesmanFilter(filter))
          .then(data => vm.outlets = data)
      ];

      vm.setBusy(q);

      if (unWatchRefresh) {
        unWatchRefresh();
      }

      unWatchRefresh = $scope.$watchGroup(['vm.campaignId', 'vm.outletId'], loadPhotoReports);

    }

    function loadCampaignGroup() {

      return CampaignGroup.findAll(CampaignGroup.meta.filterActual())
        .then(campaignGroups => {

          vm.campaignGroups = _.orderBy(campaignGroups, ['dateB'], ['desc']);

          if (!vm.campaignGroupId) {
            vm.campaignGroupId = _.get(defaultGroup(moment().format()),'id');
          }

          $scope.$watch('vm.campaignGroupId', onCampaignGroupChange);

        });


    }

    function defaultGroup(today) {
      return _.find(vm.campaignGroups, group => group.dateB <= today && today <= group.dateE);
    }

    function onCampaignGroupChange(campaignGroupId) {

      vm.campaignGroup = CampaignGroup.get(campaignGroupId);

      if (!campaignGroupId) {
        vm.campaigns = [];
        return;
      }

      PhotoReporting.campaignsByGroupAll(vm.campaignGroup)
        .then(allCampaigns => {
          vm.allCampaigns = allCampaigns;
          return PhotoReporting.campaignsByGroup(vm.campaignGroup);
        })
        .then(campaigns => {

          vm.campaigns = campaigns;

          if (vm.campaignId && !_.find(campaigns, {id: vm.campaignId})) {
            vm.campaignId = null;
          }

          loadPhotoReports();

        });

    }

  }

})(angular.module('Sales'));
