'use strict';

(function () {

  function oldShippingPhotos(Schema, Helpers, $scope, GalleryHelper, Sockets) {

    const {ShipmentRoute, ShipmentRoutePoint, ShipmentRoutePointPhoto} = Schema.models();
    const {saControllerHelper, toastr} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        isPopoverOpen: false,

        addItemClick,
        thumbClick,
        deleteClick

      });

    // SalesmanAuth.watchCurrent($scope, refresh);
    refresh();

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['ShipmentRoutePointPhoto']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'ShipmentRoutePointPhoto') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      ShipmentRoutePointPhoto.inject(data);

    }

    function deleteClick(picture) {
      ShipmentRoutePointPhoto.destroy(picture);
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

      let q = [
        ShipmentRoute.findAll(),
        ShipmentRoutePoint.findAll()
          .then(() => {
            return ShipmentRoutePointPhoto.findAllWithRelations({}, {bypassCache: true})(['ShipmentRoutePoint']);
          })
      ];

      vm.setBusy(q);
      vm.rebindAll(ShipmentRoutePointPhoto, {orderBy: [['deviceCts', 'DESC']]}, 'vm.data');

    }

  }

  angular.module('webPage')
    .controller('oldShippingPhotos', oldShippingPhotos);

}());
