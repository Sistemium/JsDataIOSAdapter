(function (module) {

  module.component('possibleOutletVisit', {

    bindings: {
      outletId: '<',
    },

    controller: possibleOutletVisitController,

    templateUrl: 'app/domain/sales/possibleOutlets/visit/possibleOutletVisit.html',
    controllerAs: 'vm'

  });

  const REQUIRED_ACCURACY = 500;

  function possibleOutletVisitController(saControllerHelper, $scope, SalesService,
                                         LocationHelper, ConfirmModal, $q, PhotoHelper,
                                         GalleryHelper) {

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        $onInit() {
          SalesService.bindPossibleOutlet($scope, this.outletId);
        },
        locateClick() {
          this.setBusy(getLocation(), 'Получение геопозиции');
        },
        thumbClick(picture) {
          this.commentText = this.outlet.name;
          $scope.imagesAll = this.photos;
          return this.thumbnailClick(picture);
        },
      })
      .use(GalleryHelper);

    function getLocation() {

      return LocationHelper.getLocation(REQUIRED_ACCURACY, vm.outletId, 'PossibleOutlet')
        .then(location => {

          if (location.horizontalAccuracy <= REQUIRED_ACCURACY) {
            return SalesService.savePossibleOutletLocation(vm.outlet, location);
          }

          let message = [
            `Требуемая точность — ${REQUIRED_ACCURACY}м.`,
            `Достигнутая точность — ${location.horizontalAccuracy}м.`,
          ].join(' ');

          return ConfirmModal.showMessageAskRepeat(message, getLocation, $q.reject());

        });

    }

  }

})(angular.module('Sales'));
