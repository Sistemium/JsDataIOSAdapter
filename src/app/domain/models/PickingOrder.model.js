'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

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
          return Schema.aggregate('volume').sum(this.positions);
        },

        totalBoxVolume: function () {
          return Schema.aggregate('boxVolume').sumFn(this.positions);
        },

        positionsCount: function () {
          return this.positions.length;
        }

      }

    });

  });

})();
