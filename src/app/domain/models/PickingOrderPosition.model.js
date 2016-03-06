'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'PickingOrderPosition',

        relations: {
          belongsTo: {
            PickingOrder: {
              localField: 'PickingOrder',
              localKey: 'pickingOrder'
            }
          },
          hasOne: {
            Article: {
              localField: 'Article',
              localKey: 'article'
            }
          }
        },

        fieldTypes: {
          volume: 'int',
          ord: 'int'
        },

        methods: {
          boxVolume: function () {
            return this.Article && this.Article.boxVolume (this.volume) || 0;
          }
        }

      });

    });

})();
