(function (module) {

  module.component('saleOrderDiscountPopover', {

    bindings: {
      saleOrder: '<',
      catalogueDiscounts: '=discounts'
    },

    templateUrl: 'app/domain/sales/saleOrder/saleOrderDiscountInfo/saleOrderDiscountPopover.html',

    controllerAs: 'vm',
    controller: saleOrderDiscountPopoverController

  });

  function saleOrderDiscountPopoverController(Schema, $scope) {

    const {SaleOrderDiscount, Article, PriceGroup} = Schema.models();

    const vm = _.assign(this, {
      $onInit
    });

    /*
    Functions
     */

    function $onInit() {

      let {catalogueDiscounts, saleOrder} = vm;

      vm.totalCostNoDiscount = _.sumBy(saleOrder.positions, position => {
        return position.priceOrigin * position.volume;
      });

      if (catalogueDiscounts) {
        return onCatalogueDiscounts(catalogueDiscounts);
      }

      let saleOrderId = vm.saleOrder.id;
      let orderBy = [['discountScope', 'DESC']];

      SaleOrderDiscount.bindAll({saleOrderId, orderBy}, $scope, 'vm.saleOrderDiscounts', onSaleOrderDiscounts);
      vm.busy = SaleOrderDiscount.findAllWithRelations({saleOrderId}, {bypassCache: true})(['PriceGroup', 'Article'])
        .finally(() => vm.busy = false);

    }

    function onSaleOrderDiscounts() {
      setDiscounts(SaleOrderDiscount.meta.updateDiscountsWithSaleOrder(vm.saleOrderDiscounts, vm.saleOrder.positions));
    }

    function onCatalogueDiscounts(catalogueDiscounts) {

      let discountsArray = [];

      _.each(catalogueDiscounts, (discounts, discountScope) => {

        if (discounts.discount) {
          discountsArray.push(discounts);
          return;
        }

        let mapped = _.map(discounts, (discount, id) => {

          let {articleId, priceGroupId} = discount;

          let article = articleId && Article.get(articleId);

          if (articleId && !article) {
            return;
          }

          let res = {

            id: discount.id || id,
            discountScope,
            articleId,
            priceGroupId,
            discount: discount.discount,
            article,
            priceGroup: priceGroupId && PriceGroup.get(priceGroupId)

          };

          if (priceGroupId && !res.priceGroup) {
            PriceGroup.find(priceGroupId)
              .then(priceGroup => res.priceGroup = priceGroup);
          }

          return res;

        });

        mapped = _.filter(mapped);

        discountsArray.push(...mapped);

      });

      setDiscounts(discountsArray);

    }

    function setDiscounts(discountsArray) {
      vm.discounts = _.orderBy(
        discountsArray,
        ['discountScope', 'article.name', 'priceGroup.name'],
        ['desc', 'asc', 'asc']
      );
    }

  }

})(angular.module('Sales'));
