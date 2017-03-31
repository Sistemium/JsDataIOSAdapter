'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ArticlePictureArticle',

      /*
       fields: thumbnailSrc, smallSrc, largeSrc
       */

      relations: {
        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          },
          ArticlePicture: {
            localField: 'picture',
            localKey: 'pictureId'
          }
        }
      }

    });

  });

})();
