'use strict';

(function () {

  function PhotoStreamController(Schema, $state, $scope, saControllerHelper, GalleryHelper) {

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        refresh: refresh,
        outletClick: outletClick,
        thumbClick: thumbClick,
        cachedVisit

      });

    const {VisitPhoto} = Schema.models();

    const visits = {};

    function refresh() {
      let busy = VisitPhoto.findAll({}, {bypassCache: true});
      vm.setBusy(busy);
    }

    function outletClick(outlet) {
      $state.go('.outlet', {id: outlet.id});
    }

    function thumbClick(pic) {
      $scope.imagesAll = vm.photos;
      vm.thumbnailClick(pic);
    }

    function rootClick() {
      if ($state.current.name === 'photos.stream') {
        VisitPhoto.ejectAll();
        refresh();
      } else {
        $state.go('^');
      }
    }

    function cachedVisit(pic) {

      let visit = visits[pic.id];

      if (visit) return visit;

      visits[pic.id] = VisitPhoto.loadRelations(pic, 'Visit')
        .then(vp => vp.visit.DSLoadRelations('Outlet'))
        .then(visit => visit.outlet.DSLoadRelations('Partner'))
        .then(() => visits[pic.id] = pic.visit);

    }

    refresh();

    VisitPhoto.bindAll(
      {orderBy: [['deviceCts', 'DESC']]},
      $scope, 'vm.photos'
    );

    $scope.$on('rootClick', rootClick);

  }

  angular.module('webPage')
    .controller('PhotoStreamController', PhotoStreamController);

}());
