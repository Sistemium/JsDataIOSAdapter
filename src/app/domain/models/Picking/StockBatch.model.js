'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    var totalVolume = Schema.aggregate('volume').sum;

    Schema.register({

      name: 'StockBatch',

      relations: {
        hasOne: {
          Article: {
            localField: 'Article',
            localKey: 'article'
          }
        },
        hasMany: {
          StockBatchBarCode: {
            localField: 'StockBatchBarCodes',
            foreignKey: 'stockBatch'
          },
          PickingOrderPositionPicked: {
            localField: 'pickedPickingOrderPositions',
            foreignKey: 'stockBatch'
          }
        }
      },

      methods: {

        spareVolume: function () {
          var volume = (this.volume || 0) - (totalVolume(this.pickedPickingOrderPositions) || 0);
          return volume > 0 ? volume : 0;
        }

      },

      someBy: {

        barCode: function (code) {

          var SBBC = Schema.model('StockBatchBarCode');
          var SB = Schema.model('StockBatch');

          return $q(function (resolve, reject) {

            if (!code) {
              return reject('Укажите штрих-код');
            }

            SBBC.findAll({
              code: code
            }).then(function (res) {

              if (!res.length) {
                return resolve([]);
              }

              var qs = _.map(res, function (i) {
                return SBBC.loadRelations(i);
              });

              $q.all(qs).then(function (sbbcs) {

                $q.all(_.map(sbbcs, function (sbbc) {
                  return SB.loadRelations(sbbc.stockBatch, 'Article');
                })).then(resolve, reject);

              }, reject);

            });

          });
        }
      }

    });

  });

})();
