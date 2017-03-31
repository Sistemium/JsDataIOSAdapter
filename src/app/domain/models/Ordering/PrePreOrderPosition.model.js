'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PrePreOrderPosition',

      relations: {
        hasOne: {
          PrePreOrder: {
            localField: 'prePreOrder',
            foreignKey: 'prePreOrderId'
          },
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      methods: {
        // boxVolume: function () {
        //   return this.article && this.article.boxVolume (this.volume) || 0;
        // },
        // pcsVolume: function () {
        //   return this.article && this.article.pcsVolume (this.volume) || 0;
        // }
      }

    });

  });

})();
