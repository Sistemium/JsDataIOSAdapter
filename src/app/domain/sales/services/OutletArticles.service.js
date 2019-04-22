(function (module) {

  function OutletArticles(Schema, IOS) {

    const { ShipmentPosition } = Schema.models();

    function groupByArticleId(outletId) {

      let filter = { outletId };

      if (IOS.isIos()) {
        filter = { where: { 'ANY shipment': { 'outletId': { '==': outletId } } } };
      }

      return ShipmentPosition.groupBy(filter, ['articleId'])

    }

    return {
      groupByArticleId
    };

  }

  module.service('OutletArticles', OutletArticles);

})(angular.module('Sales'));
