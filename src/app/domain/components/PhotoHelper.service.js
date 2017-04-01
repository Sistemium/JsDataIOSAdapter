'use strict';

(function () {

  function PhotoHelper(IOS, Schema, $q, ConfirmModal, toastr, $window) {

    function takePhoto(resourceName, data, thumbnailCache) {

      var q = IOS.takePhoto(resourceName, data);

      return q.then(function (res) {

        if (angular.isObject(res)) {

          importThumbnail(Schema.model(resourceName).inject(res), thumbnailCache);
          $q.resolve(res);

        } else {
          $q.reject(res);
        }

      });

    }

    function importThumbnail(picture, cache) {

      return $q(function (resolve, reject) {

        if (cache[picture.id]) {
          return resolve(picture);
        }

        getImageSrc(picture, 'thumbnail')
          .then(function (src) {

            cache[picture.id] = src;
            resolve(picture);

          }, reject);

      });

    }

    function thumbnailClick(resourceName, pic, src, title) {

      ConfirmModal.show({

        text: false,
        src: src,
        title: title,

        deleteDelegate: function () {
          return Schema.model(resourceName).destroy(pic);
        },

        resolve: function (ctrl) {

          ctrl.busy = pic.getImageSrc('resized').then(function (src) {
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

    }

    function pictureClick(pic) {

      ConfirmModal.show(
        pictureClickConfig(pic, pic.href, pic.name, 'resized'),
        {
        templateUrl: 'app/components/modal/PictureModal.html',
        size: 'lg'
      });

    }

    function pictureClickConfig(pic, src, title, size) {

      return {

        text: false,
        src: src,
        title: title,

        resolve: ctrl => {

          ctrl.busy = getImageSrc(pic, size)
            .then(src => {
              ctrl.src = src;
            }, err => {

              console.log(err);
              ctrl.cancel();
              toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');

            });

        }

      }

    }

    function getImageSrc(picture, size) {

      return IOS.isIos() ? IOS.getPicture(picture.id, size)
          .then(function (data) {
            return 'data:image/jpeg;base64,' + data;
          }) : $q(function (resolve) {
          switch (size) {
            case 'resized':
              return resolve(picture.href && picture.href.replace(/(.*\/)(.*)(\..{3,4})$/, '$1smallImage$3'));
            default:
              return resolve(picture.thumbnailHref);
          }
        });

    }

    function actingImageSrc(picture, size) {

      if (picture.imageSrc) {
        return picture.imageSrc;
      }

      if (picture.imagePath && $window.location.protocol === 'file:') {
        return '../../../../pictures/' + picture.imagePath;
      }

      if (picture.href) {
        return picture.href.replace(/([^\/]+)(\.[^.]+&)/g, (match, i) => i ? size :  match);
      }

      return null;

    }

    function setupModel(model) {

      let computed = model.computed || (model.computed = {});

      _.assign(computed, {

        srcThumbnail  : function() {
          return actingImageSrc(this, 'thumbnail');
        },
        srcFullscreen : function() {
          return actingImageSrc(this, 'smallImage');
        }

      });

      return model;

    }

    return {
      takePhoto,
      importThumbnail,
      thumbnailClick,
      pictureClick,
      getImageSrc,
      actingImageSrc,
      setupModel
    };

  }

  angular.module('core.services')
    .service('PhotoHelper', PhotoHelper);

})();
