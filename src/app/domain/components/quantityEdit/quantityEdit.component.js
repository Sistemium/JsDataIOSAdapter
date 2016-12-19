'use strict';

(function () {

  const quantityEdit = {

    bindings: {
      article: '=',
      saleOrder: '=',
      price: '='
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: quantityEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function quantityEditController() {

    let vm = this;

    _.assign(vm, {

      boxPcs: () => {
        let position = _.find(vm.saleOrder.positions, {articleId: vm.article.id});
        if (!position || !position.volume) return;
        return vm.article.boxPcs(position.volume).full;
      }

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
