'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      const POPP = Schema.models().PickingOrderPositionPicked;
      let totalVolume = Schema.aggregate('volume').sum;
      let totalUnPickedVolume = Schema.aggregate('unPickedVolume').sumFn;

      function isPicked (positions) {
        return !totalUnPickedVolume (positions);
      }

      function hasPicked (positions) {
        return !!_.filter(positions, pos => {
          return !!pos.pickedPositions.length;
        }).length;
      }

      function maxTs (positions) {
        return _.reduce (positions, (res, pos) => {
          const lastPos = _.maxBy (pos.pickedPositions, pp => {
            return POPP.lastModified (pp.id);
          });
          return Math.max (lastPos && POPP.lastModified (lastPos) || 0, res);
        },0);
      }

      Schema.register ({

        name: 'PickingOrderPosition',

        relations: {
          belongsTo: {
            PickingOrder: {
              localField: 'PickingOrder',
              localKey: 'pickingOrderId'
            }
          },
          hasOne: {
            Article: {
              localField: 'Article',
              localKey: 'articleId'
            }
          },
          hasMany: {
            PickingOrderPositionPicked: {
              localField: 'pickedPositions',
              foreignKey: 'pickingOrderPositionId'
            }
          }
        },

        // fieldTypes: {
          // volume: 'int',
          // ord: 'int'
        // },

        methods: {

          boxVolume: function () {
            return this.Article && this.Article.boxVolume (this.volume) || 0;
          },

          boxPcs: function (volume) {
            return this.Article && this.Article.boxPcs (angular.isUndefined(volume) ? this.volume : volume) || {};
          },

          linkStockBatch: function (sb, code, volume) {

            return POPP.create({
              stockBatchId: sb.id,
              pickingOrderPositionId: this.id,
              volume: volume || this.volume,
              articleId: sb.articleId,
              code: code
            });

          },

          unPickedBoxVolume: function () {
            return this.Article && this.Article.boxVolume (this.unPickedVolume()) || 0;
          },

          unPickedVolume: function () {
            return this.volume - (totalVolume (this.pickedPositions) || 0);
          },

          unPickedBoxPcs: function () {
            return this.boxPcs (this.unPickedVolume());
          }

        },

        etc: {

          pivotPositionsByArticle:  function (articleIndex) {
            return _.orderBy(_.map(articleIndex, function (positions, key) {

              const totalVolume = _.reduce(positions, (sum, pos) => {
                return sum + pos.volume;
              }, 0);

              const article = positions[0].Article;
              const boxPcs = article && article.boxPcs(totalVolume);
              const picked = isPicked(positions);
              const totalUnPicked = totalUnPickedVolume (positions);

              return {

                id: key,
                sameId: article.sameId,
                article,
                positions,
                volume: boxPcs,
                totalVolume,
                isPicked: picked,
                hasPicked: hasPicked(positions),
                totalUnPickedVolume: totalUnPicked,
                ts: maxTs(positions),

                orderVolume: order => {
                  const p = _.find(positions, ['pickingOrder', order.id]);
                  return article.boxPcs(p && p.volume || 0);
                },

                position: order => {
                  return _.find(positions, ['pickingOrder', order.id]);
                },

                updatePicked: function () {
                  this.isPicked = isPicked(positions);
                  this.ts = maxTs(positions);
                  this.totalUnPickedVolume = totalUnPickedVolume(positions);
                  this.hasPicked = hasPicked(positions);
                }

              }

            }), 'article.name');

          }

        }

      });

    });

})();
