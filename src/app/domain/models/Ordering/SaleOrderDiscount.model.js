'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

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
        updateSaleOrder,
        updateDiscountsWithSaleOrder,
        ensureUnique
      }

    });

    function ensureUnique(saleOrder) {

      let scopes = _.groupBy(saleOrder.discounts, 'discountScope');

      let articleScope = _.groupBy(scopes.article, 'articleId');
      let priceGroupScope = _.groupBy(scopes.priceGroup, 'priceGroupId');
      let saleOrderScope = scopes.saleOrder;

      let res = [
        ...destroyToEnsureUniqueScope(articleScope),
        ...destroyToEnsureUniqueScope(priceGroupScope),
        ...destroyToEnsureUniqueScope(saleOrderScope)
      ];

      return $q.all(_.map(res, item => SaleOrderDiscount.destroy(item.id)))
        .then(res => {
          console.warn('ensureUnique destroyed', res);
        })
        .catch(err => {
          console.warn('ensureUnique destroyed fail', err);
        });

    }

    function destroyToEnsureUniqueScope(groupedScopeData) {

      let res = _.map(groupedScopeData, (records) => {

        if (records.length < 2) return;

        return records.slice(1);

      });

      return _.flatten(_.filter(res));

    }

    function updateSaleOrder(saleOrder, scopePath, discount, discountDoc = discount) {

      if (_.isUndefined(discount)) {
        console.warn('undefined discount', scopePath);
        return $q.reject('undefined discount');
      }

      let {discounts} = saleOrder;
      let [discountScope, id = saleOrder.id] = scopePath.split('.');

      let filter = _.set({discountScope}, `${discountScope}Id`, id);

      let existing = _.find(discounts, filter);

      if (!existing) {
        let data = _.assign({
          saleOrderId: saleOrder.id,
          processing: 'draft',
          discount,
          discountDoc
        }, filter);
        return SaleOrderDiscount.create(data);
      }

      existing.discount = discount;
      existing.discountDoc = discountDoc;

      if (!existing.DSHasChanges()) {
        return $q.resolve(existing);
      }

      return existing.DSCreate();

    }

    function updateDiscountsWithSaleOrder(discounts, saleOrderPositions) {

      let saleOrderScopeDiscount = _.find(discounts, {discountScope: 'saleOrder'});

      _.each(saleOrderPositions, pos => {

        let {articleId, priceOrigin, price} = pos;
        let posDiscount = priceOrigin ? _.round((priceOrigin - price) / priceOrigin * 100.0, 2) : 0;

        let articleDiscount = _.find(discounts, {articleId});

        let discount = articleDiscount ||
          _.find(discounts, {priceGroupId: pos.article.priceGroupId}) ||
          saleOrderScopeDiscount;

        if (!discount && posDiscount || discount && Math.abs(priceOrigin * (1.0 - discount.discount / 100.0) - price) > 0.01) {
          let customDiscount = _.assign(articleDiscount || SaleOrderDiscount.createInstance({id: articleId}), {
            discount: posDiscount,
            articleId,
            discountScope: 'article'
          });
          if (!articleDiscount) {
            discounts.push(customDiscount);
          }
        }


      });

      return discounts;

    }

  });

})();
