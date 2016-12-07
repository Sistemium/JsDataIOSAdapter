'use strict';

(function () {

  const quantityEdit = {

    bindings: {
      stock: '=',
      saleOrder: '='
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: function ($scope, IOS) {

      let vm = this;

      let positions = _.get(vm.saleOrder, 'positions');
      let position = _.find(positions, {articleId: vm.stock.articleId});

      let article = position.article;

      _.assign(vm, {

        type: IOS.isIos() ? 'number' : 'text',

        incrementBoxes: () => changeVolume(article.packageRel),
        incrementBottles: () => changeVolume(1),
        decrementBoxes: () => changeVolume(-article.packageRel),
        decrementBottles: () => changeVolume(-1)

      });

      /*
       Init
       */

      setQty();

      /*
       Listeners
       */

      $scope.$watchGroup(['vm.boxes', 'vm.bottles'], onQtyChange);

      /*
       Functions
       */

      function onQtyChange(newValues) {
        position.volume = (newValues[0] * position.article.packageRel || 0) + (newValues[1] || 0);
        position.updateCost();
        vm.saleOrder.updateTotalCost();
      }

      function changeVolume(addVolume) {
        position.volume += addVolume;
        setQty();
      }

      function setQty() {
        let boxPcs = position ? position.article.boxPcs(position.volume) : {};
        _.assign(vm, {
          boxes: boxPcs.box,
          bottles: boxPcs.pcs
        });
      }

    },

    controllerAs: 'vm'

  };

  angular.module('sistemium')
    .component('quantityEdit', quantityEdit);

})();
