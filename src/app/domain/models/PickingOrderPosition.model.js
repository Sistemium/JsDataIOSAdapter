'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      var POPP = Schema.models.PickingOrderPositionPicked;
      var totalVolume = Schema.aggregate('volume').sum;

      Schema.register ({

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
          },
          hasMany: {
            PickingOrderPositionPicked: {
              localField: 'pickedPositions',
              foreignKey: 'pickingOrderPosition'
            }
          }
        },

        fieldTypes: {
          volume: 'int',
          ord: 'int'
        },

        methods: {

          boxVolume: function () {
            return this.Article && this.Article.boxVolume (this.volume) || 0;
          },

          boxPcs: function (volume) {
            return this.Article && this.Article.boxPcs (angular.isUndefined(volume) ? this.volume : volume) || {};
          },

          linkStockBatch: function (sb, volume, productionInfo) {

            return POPP.create({
              sb: sb,
              pickingOrderPosition: this.id,
              volume: volume || this.volume,
              productionInfo: productionInfo
            });

          },

          unPickedVolume: function () {
            return this.volume - totalVolume (this.pickedPositions);
          },

          unPickedBoxPcs: function () {
            return this.boxPcs (this.unPickedVolume());
          }

        },

        etc: {

          pivotPositionsByArticle:  function (articleIndex) {
            return _.orderBy(_.map(articleIndex, function (val, key) {

              var totalVolume = _.reduce(val, function (sum, pos) {
                return sum + pos.volume;
              }, 0);

              var article = val[0].Article;
              var boxPcs = article && article.boxPcs(totalVolume);

              //SBBC.someBy.article (article.id).then (function (sbbcs){
              //  vm.sbbcs.push ({
              //    id: article.id,
              //    sbbcs: sbbcs
              //  });
              //});

              return {

                id: key,
                article: val[0].Article,
                positions: val,
                volume: boxPcs,
                totalVolume: totalVolume,

                orderVolume: function (order) {
                  var p = _.find(val, ['pickingOrder', order.id]);
                  return article.boxPcs(p && p.volume || 0);
                },

                position: function (order) {
                  return _.find(val, ['pickingOrder', order.id]);
                }

              }

            }), 'article.name');

          }

        }

      });

    });

})();
