'use strict';

(function () {

  function PhotoStreamController(Schema, $q, $state, $scope, SalesmanAuth) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    //var Partner = Schema.model('Partner');
    //var SM = Schema.model('Salesman');
    var Visit = Schema.model('Visit');
    var VisitPhoto = Schema.model('VisitPhoto');
    var stateFilter = {};

    var salesman = SalesmanAuth.getCurrentUser();
    var thumbnails = {};

    if (salesman) {
      stateFilter.salesmanId = salesman.id;
    }

    function pics(pic) {

      var photo = thumbnails[pic.id];

      if (photo) {
        return photo;
      }

      thumbnails[pic.id] = VisitPhoto.loadRelations(pic, 'Visit')
        .then(function () {

          thumbnails[pic.id] = {
            visit: pic.visit
          };

          importThumbnail(pic);

          return Visit.loadRelations(pic.visit, 'Outlet');

        })
        .then(function (visit) {
          Outlet.loadRelations(visit.outlet, 'Partner');
          return thumbnails[pic.id];
        });


    }

    function refresh() {
      vm.busy =
        VisitPhoto.findAll({}, {bypassCache: true});
    }

    function outletClick(outlet) {
      $state.go('.outlet', {id: outlet.id});
    }

    function importThumbnail(vp) {

      if (thumbnails[vp.id].src) {
        return vp;
      }

      return vp.getImageSrc('thumbnail').then(function (src) {
        thumbnails[vp.id].src = src;
        return vp;
      });

    }

    function thumbnailClick(pic) {


      $state.go('.photo', {id: pic.id});

      // ConfirmModal.show(cfg, {
      //   templateUrl: 'app/components/modal/PictureModal.html',
      //   size: 'lg'
      // });

    }

    function rootClick () {
      if ($state.current.name === 'photos.stream') {
        VisitPhoto.ejectAll();
        refresh();
      } else {
        $state.go('^');
      }
    }

    angular.extend(vm, {

      thumbnails: [],
      refresh: refresh,
      outletClick: outletClick,
      thumbnailClick: thumbnailClick,
      pics: pics

    });

    vm.refresh();

    VisitPhoto.bindAll(
      {
        orderBy: [
          ['deviceCts', 'DESC']

        ]
      },
      $scope, 'vm.photos'
    );

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.hideStream = !! _.get(to, 'params.id');
    });

    $scope.$on('rootClick', function(){
      rootClick();
    });

  }

  angular.module('webPage')
    .controller('PhotoStreamController', PhotoStreamController)
  ;

}());
