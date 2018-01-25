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

  function quantityEditController() {

    let vm = this;

    _.assign(vm, {

      boxPcs: () => {

        let position = vm.position;
        let article = vm.article || _.get(position, 'article');

        if (!article || !position || !position.volume) return;

        return article.boxPcs(position.volume, false).full;

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
