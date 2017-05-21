(function (module) {

  module('Sales').controller('PhotoReportListController', PhotoReportListController);

  function PhotoReportListController(Schema, Helpers, $scope, SalesmanAuth, GalleryHelper) {

    const {PhotoReport, Outlet, Campaign, CampaignGroup} = Schema.models();
    const {saControllerHelper, toastr} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({
        addItemClick
      });

    SalesmanAuth.watchCurrent($scope, refresh);

    /*
     Functions
     */

    function addItemClick() {
      toastr.info('Добавить Фото-отчет');
    }

    function refresh() {

      let sort = {
        orderBy: ['ts']
      };

      let filter = SalesmanAuth.makeFilter(sort);

      let q = [
        CampaignGroup.findAll(),
        Campaign.findAll(),
        Outlet.findAll(Outlet.meta.salesmanFilter(filter))
          .then(() => {
            return PhotoReport.findAllWithRelations(filter, {bypassCache: true})(['Outlet']);
          })
      ];

      vm.setBusy(q);
      vm.rebindAll(PhotoReport, {orderBy: [['deviceCts', 'DESC']]}, 'vm.data');

    }

  }

})(angular.module);
