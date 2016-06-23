'use strict';

(function () {

  function PhotoStreamController(Schema, $q, $state, ConfirmModal, toastr, SalesmanAuth) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');
    var SM = Schema.model('Salesman');
    var VisitPhoto = Schema.model('VisitPhoto');
    var stateFilter = {};

    var salesman = SalesmanAuth.getCurrentUser();

    if (salesman) {
      stateFilter.salesmanId = salesman.id;
    }

    function refresh() {

      vm.busy = $q.all([
        Partner.findAll()
          .then(function (res) {
            vm.partners = res;
          }),
        SM.findAll(),
        Outlet.findAll(stateFilter, {limit: 1000}),
        VisitPhoto.findAllWithRelations()('Visit')
      ])
        .then(function (res) {
          vm.photos = _.last(res);
          _.each(vm.photos, importThumbnail);
        });
    }

    function outletClick(outlet) {
      $state.go('.outlet', {id: outlet.id});
    }

    function importThumbnail(vp) {

      if (vm.thumbnails[vp.id]) {
        return vp;
      }

      return vp.getImageSrc('thumbnail').then(function (src) {
        vm.thumbnails[vp.id] = src;
        return vp;
      });

    }

    function thumbnailClick(pic) {
      vm.busy = pic.getImageSrc('resized').then(function (src) {

        ConfirmModal.show({
          src: src,
          text: false,
          title: pic.visit.outlet.partner.shortName + ' (' + pic.visit.outlet.address + ')',
          deleteDelegate: function () {
            return VisitPhoto.destroy(pic);
          }
        }, {
          templateUrl: 'app/components/modal/PictureModal.html',
          size: 'lg'
        });

      }, function (err) {
        console.log(err);
        toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');
      });
    }

    angular.extend(vm, {

      thumbnails: [],
      refresh: refresh,
      outletClick: outletClick,
      thumbnailClick: thumbnailClick

    });

    vm.refresh();

  }

  angular.module('webPage')
    .controller('PhotoStreamController', PhotoStreamController)
  ;

}());
