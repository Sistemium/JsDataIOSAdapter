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
            return _.reduce(this.positions,function(sum,p){
              return sum + p.volume;
            },0);
          },

          totalBoxVolume: function () {
            return _.reduce(this.positions,function(sum,p){
              return sum + (p.Article ? p.volume / p.Article.packageRel : 0);
            },0.0);
          }

        },

        agg: {

          totalVolume: function (items) {
            return _.reduce(items,function(sum,p){
              return sum + p.totalVolume();
            },0);
          },

          totalBoxVolume: function (items) {
            return _.reduce(items,function(sum,p){
              return sum + p.totalBoxVolume();
            },0.0);
          },

          totalPositionsCount: function (items) {
            return _.reduce(items, function(sum,order){
              return sum + order.positions.length;
            },0);
          }

        }

      });

    });

})();
