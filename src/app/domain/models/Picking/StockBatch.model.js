'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const totalVolume = Schema.aggregate('volume').sum;

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
          const volume = (this.volume || 0) - (totalVolume(this.pickedPickingOrderPositions) || 0);
          return volume > 0 ? volume : 0;
        }

      },

      someBy: {

        barCode: code => {

          const SBBC = Schema.model('StockBatchBarCode');
          const SB = Schema.model('StockBatch');

          return $q((resolve, reject) => {

            if (!code) {
              return reject('Укажите штрих-код');
            }

            SBBC.findAll({
              code: code
            }).then(res => {

              if (!res.length) {
                return resolve([]);
              }

              const qs = _.map(res, i => {
                return SBBC.loadRelations(i);
              });

              $q.all(qs).then(sbbcs => {

                $q.all(_.map(sbbcs, sbbc => {
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
