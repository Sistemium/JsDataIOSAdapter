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

      if (_.isUndefined(discount)) {
        console.warn('undefined discount', scopePath);
        return;
      }

      let {discounts} = saleOrder;
      let paths = scopePath.split('.');
      let discountScope = _.first(paths);
      let id = paths[1] || saleOrder.id;

      let filter = _.set({discountScope}, `${discountScope}Id`, id);

      let existing = _.find(discounts, filter);

      if (!existing) {
        let data = _.assign({
          saleOrderId: saleOrder.id,
          processing: 'draft',
          discount
        }, filter);
        return SaleOrderDiscount.create(data);
      }

      existing.discount = discount;

      if (!existing.DSHasChanges()) {
        console.info('ignoring path', scopePath, discount);
        return;
      }

      existing.DSCreate();

    }

  });

})();
