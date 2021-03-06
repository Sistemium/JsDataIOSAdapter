'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q, saAsync) {

    const { PickingOrderPositionPicked } = Schema.models();

    let totalVolume = Schema.aggregate('volume').sum;
    let totalUnPickedVolume = Schema.aggregate('unPickedVolume').sumFn;

    function isPicked(positions) {
      return !totalUnPickedVolume(positions);
    }

    function hasPicked(positions) {
      return !!_.filter(positions, pos => {
        return !!pos.pickedPositions.length;
      }).length;
    }

    function maxTs(positions) {
      return _.reduce(positions, (res, pos) => {
        const lastPos = _.maxBy(pos.pickedPositions, pp => {
          return PickingOrderPositionPicked.lastModified(pp.id);
        });
        return Math.max(lastPos && PickingOrderPositionPicked.lastModified(lastPos) || 0, res);
      }, 0);
    }

    Schema.register({

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

        setPicked(boxOrPalette, warehousePaletteId) {
          if (boxOrPalette.ownerXid === this.pickingOrderId) {
            return;
          }
          // if (boxOrPalette.currentPaletteId) {
          boxOrPalette.currentPaletteId = warehousePaletteId;
          // }
          boxOrPalette.processing = 'picked';
          boxOrPalette.ownerXid = this.pickingOrderId;
          return boxOrPalette.DSCreate({ cacheResponse: false });
        },

        boxVolume: function () {
          return this.Article && this.Article.boxVolume(this.volume) || 0;
        },

        boxPcs: function (volume) {
          return this.Article && this.Article.boxPcs(angular.isUndefined(volume)
            ? this.volume : volume, true) || {};
        },

        linkStockBatch({ articleId, id: stockBatchId }, code, volume) {

          return PickingOrderPositionPicked.create({
            pickingOrderPositionId: this.id,
            volume: volume || this.volume,
            stockBatchId,
            articleId,
            code
          });

        },

        linkPickedPaletteBoxes(palette, boxedItems, onBoxProgress = _.noop) {

          return this.setPicked(palette)
            .then(() => $q((resolve, reject) => {

              const tasks = _.map(boxedItems, ({ warehouseBox, items }, idx) =>
                done => this.linkPickedBoxItems(warehouseBox, items, palette.id)
                  .then(() => {
                    done();
                    onBoxProgress(idx + 1, boxedItems.length);
                  }, done)
              );

              saAsync.series(tasks, err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });

            }));

        },

        linkPickedBoxItems(warehouseBox, warehouseItems, warehousePaletteId = null) {

          const { WarehouseItemOperation } = Schema.models();

          return PickingOrderPositionPicked.create({
            code: warehouseBox.barcode,
            pickingOrderPositionId: this.id,
            volume: warehouseItems.length,
            warehouseBoxId: warehouseBox.id,
          })
            .then(p => WarehouseItemOperation.meta.createForOwner({
              source: 'PickingOrderPositionPicked',
              ownerXid: p.id,
              warehouseBox,
              warehouseItems,
            }))
            .then(() => this.setPicked(warehouseBox, warehousePaletteId));
        },

        unPickedBoxVolume: function () {
          return this.Article && this.Article.boxVolume(this.unPickedVolume()) || 0;
        },

        unPickedVolume: function () {
          return this.volume - (totalVolume(this.pickedPositions) || 0);
        },

        unPickedBoxPcs: function () {
          return this.boxPcs(this.unPickedVolume(), true);
        }

      },

      etc: {

        pivotPositionsByArticle(articleIndex, orders) {

          return _.orderBy(_.map(articleIndex, (positions, key) => {

            const totalVolume = _.reduce(positions, (sum, pos) => {
              return sum + pos.volume;
            }, 0);

            const article = positions[0].Article;
            const boxPcs = article && article.boxPcs(totalVolume, true);
            const picked = isPicked(positions);
            const totalUnPicked = totalUnPickedVolume(positions);

            const sortedPositions = _.orderBy(positions, ({ PickingOrder }) => {
              return orders.indexOf(PickingOrder);
            });

            return {

              id: key,
              sameId: article.sameId,
              article,
              positions: sortedPositions,
              volume: boxPcs,
              totalVolume,
              isPicked: picked,
              hasPicked: hasPicked(positions),
              totalUnPickedVolume: totalUnPicked,
              ts: maxTs(positions),

              orderVolume(order) {
                const p = _.find(positions, { pickingOrderId: order.id });
                return article.boxPcs(p && p.volume || 0);
              },

              position(order) {
                return _.find(positions, { pickingOrderId: order.id });
              },

              updatePicked() {
                this.isPicked = isPicked(positions);
                this.ts = maxTs(positions);
                this.totalUnPickedVolume = totalUnPickedVolume(positions);
                this.hasPicked = hasPicked(positions);
                return this.totalUnPickedVolume;
              },

            }

          }), 'article.name');

        }

      }

    });

  });

})();
