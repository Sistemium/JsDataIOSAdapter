(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  function PlayGroundController($scope, IOS, Schema, saApp, Sockets, ConfirmModal) {

    var vm = this;
    var Visit = Schema.model('Visit');
    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');
    var VisitPhoto = Schema.model('VisitPhoto');

    vm.jsData = [];

    function onJSData(res) {
      vm.jsData.push(res);
    }

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['VisitPhoto']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    vm.version = saApp.version();

    Visit.findAll()
      .then(function (res) {
        vm.visit = res [0];
      });

    VisitPhoto.findAll()
      .then(function (photos) {
        vm.pictures = _.orderBy(photos, 'deviceCts', 'desc');
        _.each(photos, function (photo) {
          photo.getImageSrc().then(function (src) {
            photo.srcThumbnail = src;
          });
        });
      });

    vm.thumbnailClick = function (pic) {
      pic.getImageSrc('resized').then(function (src) {
        Outlet.find(pic.visit.outletId).then(function (o) {
          Partner.find(o.partnerId).then(function (p) {
            ConfirmModal.show({
              src: src,
              text: false,
              title: p.shortName + ' (' + o.address + ')'
            }, {
              templateUrl: 'app/components/modal/PictureModal.html',
              size: 'lg'
            });
          });
        });
      });
    };

    vm.takePhoto = function () {
      var q = IOS.takePhoto('VisitPhoto', {
        visitId: vm.visit.id
      });

      q.then(function (res) {

        vm.pictures.splice(0,0,vm.photo = VisitPhoto.inject(res));

        vm.photo.getImageSrc('thumbnail').then(function (src) {
          vm.photo.srcThumbnail = src;
        })

      }).catch(function (res) {
        vm.photo = false;
        vm.error = res;
      })
    };

  }
})();
