(function () {

  angular.module('Warehousing').run((Schema) => {

    let stockTakingItemStats = {};

    Schema.register({

      name: 'StockTaking',

      // adapter: 'localStorage',

      relations: {
        belongsTo: {
          Warehouse: {
            localField: 'warehouse',
            localKey: 'warehouseId',
          },
        },
        hasMany: {
          StockTakingItem: {
            localField: 'items',
            foreignKey: 'stockTakingId',
          },
        },
      },

      methods: {

        itemStats(name) {
          const stat = stockTakingItemStats[this.id];
          const res = (name && stat) ? stat[name] : null;
          if (name === 'sum(volume)' && stat) {
            return (res || 0) + stat.marksCount;
          }
          return res;
        },

        isValid() {
          return !!this.warehouseId;
        },

      },

      meta: {
        refreshStats,
      },

    }).on('DS.change', _.debounce(refreshStats, 100));


    function refreshStats() {

      const { StockTakingItem, StockTakingItemMark } = Schema.models();

      StockTakingItem.groupBy({}, ['stockTakingId'])
        .then(res => stockTakingItemStats = _.keyBy(res, 'stockTakingId'))
        .then(() => StockTakingItemMark.groupBy({}, ['stockTakingId']))
        .then(res => {
          const markStats = _.keyBy(res, 'stockTakingId');
          _.forEach(markStats, (stats, stockTakingId) => {
            const stat = stockTakingItemStats[stockTakingId];
            if (!stat) {
              return;
            }
            stat.marksCount = stats['count()'];
          });
        });

    }

  });


})();
