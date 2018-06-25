'use strict';

(function () {

  const exportConfig = [
    {
      title: 'Код',
      property: 'article.code',
      type: 'string',
    }, {
      title: 'Товар',
      property: 'article.name',
    }, {
      title: 'Факт',
      property: 'volume',
      type: 'number',
    }, {
      title: 'Учет',
      property: 'stock',
      type: 'number',
    }
  ];

  angular.module('Warehousing')
  // .constant('StockTakingExportConfig', exportConfig)
    .service('StockTakingExport', StockTakingExport);

  function StockTakingExport(ExportExcel) {

    return { asExcel };

    function asExcel({ stockTaking, stocks }) {

      let { items, warehouse, date } = stockTaking;
      let name = `${warehouse.name} - ${_.replace(date, /\//g, '-')}`;

      ExportExcel.exportArrayWithConfig(exportData(items, stocks), exportConfig, name);

    }

    function exportData(items, stocks) {

      const stockByArticle = _.keyBy(stocks, 'articleId');
      const itemsByArticle = _.groupBy(items, 'articleId');

      const found = _.map(itemsByArticle, (itemsData, articleId) => {

        return _.assign(exportItem(itemsData, articleId), {
          stock: _.get(stockByArticle[articleId], 'volume')
        });

      });

      const notFound = _.filter(stocks, ({ articleId }) => !itemsByArticle[articleId]);

      const res = _.union(found, _.map(notFound, ({ volume, article }) => ({
        article,
        stock: volume,
      })));

      return _.orderBy(res, 'article.name');

    }

    function exportItem(itemsData, articleId) {

      const { article } = itemsData[0];
      return {
        articleId,
        article,
        volume: _.sumBy(itemsData, 'volume'),
      };

    }

  }

})();