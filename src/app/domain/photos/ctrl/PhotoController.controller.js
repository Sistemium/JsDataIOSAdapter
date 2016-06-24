'use strict';

(function () {

  function PhotoController($state, $scope, Schema, toastr, $q) {

    var id = $state.params.id;
    var vm = this;
    var VisitPhoto = Schema.model('VisitPhoto');
    var Outlet = Schema.model('Outlet');
    var Visit = Schema.model('Visit');

    VisitPhoto.find(id)
      .then(function (pic) {
        vm.photo = pic;

        vm.src = pic.thumbnaiHref;

        $q.all([
          Visit.findAllWithRelations({
            id: pic.visitId
          })('Outlet')
            .then(function (visit) {
              Outlet.loadRelations(visit[0].outletId, 'Partner')
            }),
          pic.getImageSrc('resized')
            .then(function (res) {
              vm.src = res;
            })
            .catch(function (err) {
              console.log(err);
              vm.cancel();
              toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');
            })
        ]);


      });

    // VisitPhoto.bindOne(id, $scope, 'vm.photo');

    angular.extend(vm, {

      photoClick: function () {
        $state.go('^', {scrollTo: id});
      },

      deleteDelegate: function (pic) {
        return VisitPhoto.destroy(pic);
      },

      cancel: function () {
        $state.go('^');
      }

    });


  }

  angular.module('webPage')
    .controller('PhotoController', PhotoController);

})();
