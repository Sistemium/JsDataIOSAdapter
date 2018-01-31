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

      if (vm.catalogueDiscounts) {
        return onCatalogueDiscounts();
      }

      let saleOrderId = vm.saleOrder.id;
      let orderBy = [['discountScope', 'DESC']];

      SaleOrderDiscount.bindAll({saleOrderId, orderBy}, $scope, 'vm.discounts');
      vm.busy = SaleOrderDiscount.findAllWithRelations({saleOrderId}, {bypassCache: true})(['PriceGroup', 'Article'])
        .finally(() => vm.busy = false);

    }

    function onCatalogueDiscounts() {

      vm.discounts = [];

      _.each(vm.catalogueDiscounts, (discounts, discountScope) => {

        if (discounts.discount) {
          vm.discounts.push(discounts);
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

        vm.discounts.push(...mapped);

      });

      vm.discounts = _.orderBy(
        vm.discounts,
        ['discountScope', 'article.name', 'priceGroup.name'],
        ['desc', 'asc', 'asc']
      );

    }

  }

})(angular.module('Sales'));
