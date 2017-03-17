'use strict';

(function () {

  angular.module('Models').run((Schema, $window) => {

    Schema.register({

      name: 'ArticlePicture',

      /*
       fields: thumbnailSrc, smallSrc, largeSrc
       */

      relations: {
        hasMany: {
          ArticlePictureArticle: {
            localField: 'articlePictureArticles',
            foreignKey: 'pictureId'
          },
          Article: {
            localField: 'avatarArticles',
            foreignKey: 'avatarPictureId'
          }
        }
      },

      computed: {

        // TODO: refactor with a decorator fn of PhotoHelper
        srcThumbnail  : ['thumbnailSrc', 'thumbnailPath', 'href', (imageSrc, imagePath, href) => {
          return actingImageSrc(imageSrc, imagePath, href, 'thumbnail');
        }],
        srcFullscreen : ['smallSrc', 'resizedImagePath', 'href', (imageSrc, imagePath, href) => {
          return actingImageSrc(imageSrc, imagePath, href, 'smallImage');
        }]

      }

    });

    function actingImageSrc(imageSrc, imagePath, href, size) {

      if (imageSrc) {
        return imageSrc;
      }

      if (imagePath && $window.location.protocol === 'file:') {
        return '../../../../pictures/' + imagePath;
      }

      if (href) {
        return href.replace(/([^\/]+)(\.[^.]+&)/g, (match, i) => i ? size :  match);
      }

      return null;

    }

  });

})();
