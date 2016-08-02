'use strict';

(function () {

  function PhotoHelper(IOS, Schema, $q) {

    function takePhoto(resourceName, data, thumbnailCache) {

      var q = IOS.takePhoto(resourceName, data);

      return q.then(function (res) {

        importThumbnail(Schema.model(resourceName).inject(res), thumbnailCache);
        return res;

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

    return {

      takePhoto: takePhoto,
      importThumbnail: importThumbnail,
      getImageSrc: getImageSrc

    };

  }

  angular.module('core.services')
    .service('PhotoHelper', PhotoHelper);

})();
