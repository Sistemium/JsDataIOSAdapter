(function (module) {

  module('Sales').controller('PhotoReportListController', PhotoReportListController);

  function PhotoReportListController(Schema, Helpers, $scope, SalesmanAuth, GalleryHelper) {

    const {PhotoReport} = Schema.models();
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

      let q = PhotoReport.findAll(filter, {bypassCache: true});

      vm.setBusy(q);
      vm.rebindAll(PhotoReport, {}, 'vm.data');

    }

  }

})(angular.module);
