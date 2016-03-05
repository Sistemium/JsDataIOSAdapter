'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'PickingOrder',

        relations: {
          hasMany: {
            PickingOrderPosition: {
              localField: 'positions',
              foreignKey: 'pickingOrder'
            }
          }
        },

        methods: {

          totalVolume: function () {
            return Schema.aggregate('volume').sum (this.positions);
          },

          totalBoxVolume: function () {
            return _.reduce(this.positions,function(sum,p){
              return sum + (p.Article ? p.volume / p.Article.packageRel : 0);
            },0.0);
          },

          positionsCount: function () {
            return this.positions.length;
          }

        },

        agg: {

          volume: Schema.aggregate('totalVolume').sumFn ,

          boxVolume: Schema.aggregate('totalBoxVolume').sumFn,

          positionsCount: Schema.aggregate('positionsCount').sumFn

        }

      });

    });

})();
