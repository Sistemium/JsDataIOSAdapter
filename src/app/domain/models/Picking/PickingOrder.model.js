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

      fieldTypes: {
        date: 'date'
      },

      computed: {
        processingClass: ['processing', processing => {
          return 'glyphicon glyphicon-' + (() => {
            switch (processing) {
              case 'picking': {
                return 'import';
              }
              case 'picked': {
                return 'ok';
              }
              case 'ready': {
                return 'question-sign';
              }
            }
            return 'save';
          })();
        }],
        cls: ['processing', processing => {
          switch (processing) {
            case 'picking': {
              return 'red';
            }
            case 'picked': {
              return 'gray';
            }
          }
        }]
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
        },

        totalUnPickedVolume: function () {
          return Schema.aggregate('unPickedVolume').sumFn(this.positions);
        },

        totalUnPickedBoxVolume: function () {
          return Schema.aggregate('unPickedBoxVolume').sumFn(this.positions);
        },

        totalUnPickedPositionsCount: function () {
          return Schema.aggregate('unPickedVolume').custom(this.positions, (sum,unPickedVolume) => {
            return sum + (unPickedVolume ? 1 : 0);
          },0);
        },

        totalPickedPercent: function () {
          return Math.floor(this.totalUnPickedVolume() / (this.totalVolume()||1) * 100);
        }

      }

    });

  });

})();
