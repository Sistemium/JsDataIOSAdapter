'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      var POPP = Schema.models().PickingOrderPositionPicked;
      var totalVolume = Schema.aggregate('volume').sum;
      var totalUnPickedVolume = Schema.aggregate('unPickedVolume').sumFn;

      function isPicked (positions) {
        return !totalUnPickedVolume (positions);
      }

      function hasPicked (positions) {
        return !!_.filter(positions,function(pos){
          return !!pos.pickedPositions.length;
        }).length;
      }

      function maxTs (positions) {
        return _.reduce (positions,function (res,pos){
          var lastPos = _.maxBy (pos.pickedPositions, function (pp) {
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

          linkStockBatch: function (sb, code, volume) {

            return POPP.create({
              stockBatch: sb.id,
              pickingOrderPosition: this.id,
              volume: volume || this.volume,
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

              var totalVolume = _.reduce(positions, function (sum, pos) {
                return sum + pos.volume;
              }, 0);

              var article = positions[0].Article;
              var boxPcs = article && article.boxPcs(totalVolume);
              var picked = isPicked(positions);
              var totalUnPicked = totalUnPickedVolume (positions);

              return {

                id: key,
                article: positions[0].Article,
                positions: positions,
                volume: boxPcs,
                totalVolume: totalVolume,
                isPicked: picked,
                hasPicked: hasPicked(positions),
                totalUnPickedVolume: totalUnPicked,
                ts: maxTs(positions),

                orderVolume: function (order) {
                  var p = _.find(positions, ['pickingOrder', order.id]);
                  return article.boxPcs(p && p.volume || 0);
                },

                position: function (order) {
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
