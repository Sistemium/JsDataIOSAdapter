'use strict';

(function () {

    angular.module('Models').run(function (Schema, $q) {

      Schema.register ({

        name: 'StockBatch',

        relations: {
          hasOne: {
            Article: {
              localField: 'Article',
              localKey: 'article'
            }
          },
          hasMany: {
            StockBatchBarcode: {
              localField: 'StockBatchBarCodes',
              foreignKey: 'stockBatch'
            }
          }
        },

        someBy: {

          barCode: function (code) {

            var SBBC = Schema.model('StockBatchBarCode');
            var SB = Schema.model('StockBatch');

            return $q (function (resolve,reject){

              if (!code) {
                reject ('Укажите штрих-код');
              }

              SBBC.findAll({
                code: code
              }).then(function (res) {

                if (!res.length) {
                  return resolve ([]);
                }

                var qs = _.map(res, function (i) {
                  return SBBC.loadRelations(i);
                });

                $q.all(qs).then (function (sbbcs){

                  $q.all(_.map (sbbcs,function (sbbc) {
                    return SB.loadRelations(sbbc.stockBatch,'Article');
                  })).then (resolve,reject);

                },reject);

              });

            });
          }
        }

      });

    });

})();
