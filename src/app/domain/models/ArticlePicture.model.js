'use strict';

(function () {

  angular.module('Models').run((Schema, PhotoHelper) => {

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
          return PhotoHelper.actingImageSrc(imageSrc, imagePath, href, 'thumbnail');
        }],
        srcFullscreen : ['smallSrc', 'resizedImagePath', 'href', (imageSrc, imagePath, href) => {
          return PhotoHelper.actingImageSrc(imageSrc, imagePath, href, 'smallImage');
        }]

      }

    });

  });

})();
