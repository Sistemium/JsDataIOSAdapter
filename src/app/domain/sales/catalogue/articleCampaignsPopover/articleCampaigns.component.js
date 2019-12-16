(function () {

  const URL = 'app/domain/sales/catalogue/articleCampaignsPopover';

  angular.module('Sales')
    .component('articleCampaignsPopover', {

      bindings: {
        articleId: '<',
        variants: '<',
        variantId: '<',
        onVariant: '&',
        onVariantPercent: '&',
      },

      templateUrl: `${URL}/articleCampaigns.html`,
      controller: articleCampaignsController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function articleCampaignsController($scope) {

    _.assign(this, {

      popoverTemplateUrl: `${URL}/articleCampaignsPopover.html`,

      $onInit() {
        $scope.$watch('vm.variantId', id => this.onVariantId(id));
      },

      onVariantClick($variant) {
        this.popoverOpen = false;
        this.onVariant({ $variant });
      },

      onPercentClick($variant) {
        this.popoverOpen = false;
        this.onVariantPercent({ $variant });
      },

      onVariantId(id) {
        this.variant = _.find(this.variants, { id });
      },

      cancelClick() {
        this.onVariantClick(null);
      },

    });

  }

})();
