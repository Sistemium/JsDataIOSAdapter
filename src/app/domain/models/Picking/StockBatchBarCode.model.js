'use strict';

(function () {

    angular.module('Models').run(function (Schema,$q) {

      Schema.register ({

        name: 'StockBatchBarCode',

        relations: {
          belongsTo: {
            StockBatch: {
              localField: 'StockBatch',
              localKey: 'stockBatch'
            }
          }
        },

        someBy: {

          article: function (id) {

            var SB = Schema.model('StockBatch');

            return $q(function (resolve, reject) {

              if (!id) {
                return reject('Укажите товар');
              }

              SB.findAll({article: id, limit: 1}).then(function (sbs) {
                if (!sbs.length) {
                  return reject ();
                }
                SB.loadRelations(sbs[0], 'StockBatchBarCode')
                  .then(function (sb) {
                    resolve(sb.StockBatchBarCodes);
                  }, reject);
              }, reject);

            });

          }

        }

      });

    });

})();
