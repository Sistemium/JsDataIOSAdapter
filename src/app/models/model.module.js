'use strict';

(function () {

  angular.module('webPage')
    .config(function (DSProvider, DSHttpAdapterProvider) {

      var basePath = window.localStorage.getItem('JSData.BasePath')
        || 'https://api.sistemium.com/v4d/dev/';

      angular.extend(DSHttpAdapterProvider.defaults, {
        basePath: basePath,
        httpConfig: {
          headers: {
            'X-Return-Post': 'true',
            'authorization': window.localStorage.getItem('authorization')
          }
        },
        queryTransform: function queryTransform(resourceConfig, params) {
          var res = {};

          if (params.offset) {
            res['x-start-page:'] = Math.ceil(params.offset / params.limit);
          }
          if (params.limit) {
            res['x-page-size:'] = params.limit;
          }

          delete params.limit;
          delete params.offset;

          return angular.extend(res, params);
        }
      });
    })

    .service('models', function (DS, IosAdapter, $window, $log) {

      if ($window.webkit) {
        DS.registerAdapter('ios', new IosAdapter(), {default: true});
      }

      var Article = DS.defineResource({
        name: 'Article',
        relations: {
          belongsTo: {
            ArticleGroup: {
              localField: 'ArticleGroup',
              localKey: 'articleGroup'
            }
          }
        }
      });

      var ArticleGroup = DS.defineResource({
        name: 'ArticleGroup',
        relations: {
          hasMany: {
            Article: {
              localField: 'Articles',
              foreignKey: 'articleGroup'
            }
          }
        }
      });

      var PickingOrder = DS.defineResource({
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
          }
        }
      });

      var PickingOrderPosition = DS.defineResource({
        name: 'PickingOrderPosition',
        relations: {
          belongsTo: {
            PickingOrder: {
              localField: 'PickingOrder',
              localKey: 'pickingOrder'
            }
          },
          hasOne: {
            Article: {
              localField: 'Article',
              localKey: 'article'
            }
          }
        }
      });

      var StockBatch = DS.defineResource({
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
        }
      });

      var StockBatchBarCode = DS.defineResource({
        name: 'StockBatchBarCode',
        relations: {
          belongsTo: {
            StockBatch: {
              localField: 'StockBatch',
              localKey: 'stockBatch'
            }
          }
        }
      });

      var schema = {
        Article: Article,
        ArticleGroup: ArticleGroup,
        PickingOrder: PickingOrder,
        PickingOrderPosition: PickingOrderPosition,
        StockBatch: StockBatch,
        StockBatchBarCode: StockBatchBarCode
      };

      $log.log(schema);

      return schema;

    });

}());
