(function (module) {

  module('Sales').controller('PhotoReportListController', PhotoReportListController);

  function PhotoReportListController(Schema, Helpers, $scope, SalesmanAuth, GalleryHelper, Sockets) {

    const {PhotoReport, Outlet, Campaign, CampaignGroup} = Schema.models();
    const {saControllerHelper, toastr} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        isPopoverOpen: false,

        addItemClick,
        thumbClick,
        deleteClick

      });

    SalesmanAuth.watchCurrent($scope, refresh);

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['PhotoReport']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

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

    function refresh() {

      let filter = SalesmanAuth.makeFilter();

      let q = [
        CampaignGroup.findAll(),
        Campaign.findAll(),
        Outlet.findAll(Outlet.meta.salesmanFilter(filter))
          .then(() => {
            return PhotoReport.findAllWithRelations({}, {bypassCache: true})(['Outlet']);
          })
      ];

      vm.setBusy(q);
      vm.rebindAll(PhotoReport, {orderBy: [['deviceCts', 'DESC']]}, 'vm.data');

    }

  }

})(angular.module);
