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

        srcThumbnail  : function() {
          return PhotoHelper.actingImageSrc(this, 'thumbnail');
        },
        srcFullscreen : function() {
            return PhotoHelper.actingImageSrc(this, 'smallImage');
        }

      }

    });

  });

})();