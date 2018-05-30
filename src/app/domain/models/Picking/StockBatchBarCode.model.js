'use strict';

(function () {

    angular.module('Models').run(function (Schema,$q) {

      Schema.register ({

        name: 'StockBatchBarCode',

        relations: {
          belongsTo: {
            StockBatch: {
              localField: 'StockBatch',
              localKey: 'stockBatchId'
            }
          }
        },

        someBy: {

          article: id => {

            const SB = Schema.model('StockBatch');

            return $q((resolve, reject) => {

              if (!id) {
                return reject('Укажите товар');
              }

              SB.findAll({articleId: id, limit: 1}).then(sbs => {
                if (!sbs.length) {
                  return reject ();
                }
                SB.loadRelations(sbs[0], 'StockBatchBarCode')
                  .then(sb => {
                    resolve(sb.stockBatchBarCodes);
                  }, reject);
              }, reject);

            });

          }

        }

      });

    });

})();
