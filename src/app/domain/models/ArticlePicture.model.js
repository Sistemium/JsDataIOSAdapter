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

        // arrow functions does not work correctly with 'this'
        srcThumbnail  : function() {
          return PhotoHelper.actingImageSrc(this, 'thumbnail');
        },
        srcFullscreen : function() {
            return PhotoHelper.actingImageSrc(this, 'smallImage');
        }

      }

    });

<<<<<<< HEAD
=======
    function actingImageSrc(imageSrc, imagePath, href, size) {

      if (imageSrc) {
        return imageSrc;
      }

      if ($window.location.protocol === 'file:') {
        return imagePath ? '../../../../pictures/' + imagePath : null;
      }

      if (href) {
        return href.replace(/([^\/]+)(\.[^.]+&)/g, (match, i) => i ? size :  match);
      }

      return null;

    }

>>>>>>> SaleOrders2
  });

})();
