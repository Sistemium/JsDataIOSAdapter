'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const SaleOrderDiscount = Schema.register({

      name: 'SaleOrderDiscount',

      relations: {
        hasOne: {
          SaleOrder: {
            localField: 'saleOrder',
            localKey: 'saleOrderId'
          },
          Article: {
            localField: 'article',
            localKey: 'articleId'
          },
          PriceGroup: {
            localField: 'priceGroup',
            localKey: 'priceGroupId'
          }
        }
      },

      methods: {
      },

      meta: {
        updateSaleOrder
      }

    });

    function updateSaleOrder(saleOrder, scopePath, discount) {

      let {discounts} = saleOrder;
      let paths = scopePath.split('.');
      let discountScope = _.first(paths);
      let id = paths[1] || saleOrder.id;

      let filter = _.set({discountScope}, `${discountScope}Id`, id);

      let existing = _.find(discounts, filter);

      if (!existing) {
        let data = _.assign({
          saleOrderId: saleOrder.id,
          processing: 'draft'
        }, filter);
        existing = SaleOrderDiscount.createInstance(data);
      }

      if (existing.discount === discount) {
        return;
      }

      existing.discount = discount;

      existing.DSCreate();

    }

  });

})();
