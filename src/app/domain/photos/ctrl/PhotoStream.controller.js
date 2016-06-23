'use strict';

(function () {

  function PhotoStreamController(Schema, $q, $state, ConfirmModal, toastr, SalesmanAuth) {

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

      thumbnails[pic.id] = $q(function (resolve, reject) {

        VisitPhoto.loadRelations(pic,'Visit')
          .then(function(){

            var p = {
              visit: pic.visit
            };

            thumbnails[pic.id] = p;

            importThumbnail(pic);

            Visit.loadRelations(pic.visit,'Outlet')
              .then(function(){
                Outlet.loadRelations(pic.visit.outlet,'Partner');
                resolve(p);
              },reject);

          },reject);

      });

    }

    function refresh() {

      vm.busy =
        VisitPhoto.findAll()
          .then(function (res) {
            vm.photos = _.orderBy(res,'deviceCts','desc');
          });
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

      ConfirmModal.show({

        text: false,
        title: 'Загрузка ...',

        deleteDelegate: function () {
          return VisitPhoto.destroy(pic);
        },

        resolve: function(ctrl) {
          pic.getImageSrc('resized')
            .then(function (src) {
              ctrl.title = pic.visit.outlet.partner.shortName;
              ctrl.titleSmall = pic.visit.outlet.address;
              ctrl.src = src;
            }, function (err) {
              console.log(err);
              ctrl.cancel();
              toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');
            });
        }

      }, {
        templateUrl: 'app/components/modal/PictureModal.html',
        size: 'lg'
      });

      // });
    }

    angular.extend(vm, {

      thumbnails: [],
      refresh: refresh,
      outletClick: outletClick,
      thumbnailClick: thumbnailClick,
      pics: pics

    });

    vm.refresh();

  }

  angular.module('webPage')
    .controller('PhotoStreamController', PhotoStreamController)
  ;

}());
