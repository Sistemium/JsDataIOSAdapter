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

        srcThumbnail  : ['thumbnailSrc', 'thumbnailPath', (imageSrc, imagePath) => {
          return actingImageSrc(imageSrc, imagePath);
        }],
        srcFullscreen : ['smallSrc', 'resizedImagePath', (imageSrc, imagePath) => {
          return actingImageSrc(imageSrc, imagePath);
        }]

      }

    });

    function actingImageSrc(imageSrc, imagePath) {

      if (_.isString(imageSrc)) {

        return imageSrc;

      } else  {

        switch ($window.location.protocol) {
          case 'http:'  :
          case 'https:' : return () => {

            // we are in iOS but not under manifest, pechalka
            console.log('we are in iOS but not under manifest, pechalka');
            return imageSrc;

          };
          case 'file:'  : return '../../../../' + imagePath;
        }

      }

    }

  });

})();
