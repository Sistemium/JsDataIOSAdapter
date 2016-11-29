'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SaleOrderPosition',

      relations: {
        hasOne: {
          SaleOrder: {
            localField: 'saleOrder',
            localKey: 'saleOrderId'
          },
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      }

    });

  });

})();
