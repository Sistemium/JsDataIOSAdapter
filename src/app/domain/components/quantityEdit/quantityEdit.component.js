'use strict';

(function () {

  const quantityEdit = {

    bindings: {
      article: '=?',
      saleOrder: '=?',
      price: '=?',
      positionsCache: '=?',
      position: '=?'
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

        let position = vm.position;

        let article = vm.article || _.get(position, 'article');

        if (!article) return;

        if (!position) {
          position = vm.positionsCache ?
            vm.positionsCache[article.id] :
            _.find(vm.saleOrder.positions, {articleId: article.id});
        }

        if (!position || !position.volume) return;

        return article.boxPcs(position.volume).full;

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
