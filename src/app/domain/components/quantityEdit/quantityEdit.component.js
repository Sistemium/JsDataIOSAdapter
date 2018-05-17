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

  function quantityEditController($scope) {

    let vm = this;

    _.assign(vm, {

      $onInit

    });

    /*
     Init
     */

    /*
     Listeners
     */

    $scope.$watch('vm.position.volume', setBoxPcs);

    /*
     Functions
     */

    function $onInit() {
      setBoxPcs();
    }

    function boxPcs() {

      let position = vm.position;
      let article = vm.article || _.get(position, 'article');

      if (!article || !position || !position.volume) return;

      return article.boxPcs(position.volume, false);

    }

    function setBoxPcs() {

      let {box, pcs, full} = boxPcs();

      _.assign(vm, {box, pcs, full});

    }

  }

  angular.module('sistemium')
    .component('quantityEdit', quantityEdit);

})();
