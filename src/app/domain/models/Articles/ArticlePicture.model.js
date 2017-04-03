'use strict';

(function () {

  angular.module('Models').run((Schema, PhotoHelper) => {

    const config = PhotoHelper.setupModel({

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

      }

    });

    Schema.register(config);

  });

})();
