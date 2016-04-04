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
        },
        hasOne: {
          Picker: {
            localField: 'pickedBy',
            localKey: 'picker'
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
          return this.positions.length || 0;
        }

      }

    });

  });

})();
