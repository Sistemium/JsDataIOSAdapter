(function (module) {

  function OutletArticles (Schema) {

    const {ShipmentPosition} = Schema.models();

    function groupByArticleId(outletId) {

      return ShipmentPosition.groupBy({outletId}, ['articleId'])

    }

    return {
      groupByArticleId
    };

  }

  module.service('OutletArticles', OutletArticles);

})(angular.module('Sales'));
