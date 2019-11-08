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
      property: 'foundVolume',
      type: 'number',
    }, {
      title: 'Учет',
      property: 'stock',
      type: 'number',
    }, {
      title: 'Разница',
      property: 'diff',
      type: 'number',
    }
  ];

  angular.module('Warehousing')
  // .constant('StockTakingExportConfig', exportConfig)
    .service('StockTakingExport', StockTakingExport);

  function StockTakingExport(ExportExcel) {

    return { asExcel, exportData };

    function asExcel({ stockTaking, stocks }) {

      let { items, warehouse, date } = stockTaking;
      let name = `${warehouse.name} - ${_.replace(date, /\//g, '-')}`;

      ExportExcel.exportArrayWithConfig(exportData(items, stocks), exportConfig, name);

    }

    function exportData(items, stocks) {

      const stockByArticle = _.keyBy(stocks, 'articleId');
      const itemsByArticle = _.groupBy(items, 'articleId');

      const found = _.map(itemsByArticle, (itemsData, articleId) => {

        const res = exportItem(itemsData, articleId);
        const stock = _.get(stockByArticle[articleId], 'volume');
        const { foundVolume } = res;
        const diff = stock === foundVolume ? null : (stock || 0) - foundVolume;

        return _.assign(res, {
          id: articleId,
          stock,
          volume: stock,
          diff
        });

      });

      const notFound = _.filter(stocks, ({ articleId }) => !itemsByArticle[articleId]);

      const res = _.union(found, _.map(notFound, ({ volume, article }) => ({
        id: article.id,
        articleId: article.id,
        article,
        volume,
        stock: volume,
        diff: volume,
      })));

      return _.orderBy(res, 'article.name');

    }

    function exportItem(itemsData, articleId) {

      const { article } = itemsData[0];
      return {
        id: articleId,
        articleId,
        article,
        foundVolume: _.sumBy(itemsData, item => item.markOrVolume()),
      };

    }

  }

})();
