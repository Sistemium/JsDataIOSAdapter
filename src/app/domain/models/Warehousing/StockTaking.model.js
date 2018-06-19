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
          return (name && stat) ? stat[name] : stat;
        },

        isValid() {
          return !!this.warehouseId;
        },

      },

    }).on('DS.change', _.debounce(refreshStats, 100));


    function refreshStats() {
      const { StockTakingItem } = Schema.models();
      StockTakingItem.groupBy({}, ['stockTakingId'])
        .then(res => stockTakingItemStats = res)
      // .then(res => console.warn('StockTaking refreshStats', res))
      ;
    }

  });


})();
