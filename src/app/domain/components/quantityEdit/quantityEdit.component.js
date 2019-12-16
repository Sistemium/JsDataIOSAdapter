'use strict';

(function () {

  const quantityEdit = {

    bindings: {
      article: '<',
      saleOrder: '<',
      price: '<',
      position: '<',
      stock: '<'
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController($scope) {

    const vm = this;

    _.assign(vm, {

      boxPcs: () => {

        let position = vm.position;
        let article = vm.article || _.get(position, 'article');

        if (!article || !position || !position.volume) return;

        return article.boxPcs(position.volume, false).full;

      },

      campaignVariantFilter() {
        return $scope.$parent.vm.campaignVariant;
      },

    });

    /*
     Init
     */

    /*
     Listeners
     */

    /*
     Functions
     */

  }

  angular.module('sistemium')
    .component('quantityEdit', quantityEdit);

})();
