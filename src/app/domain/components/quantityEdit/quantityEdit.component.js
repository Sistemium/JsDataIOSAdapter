'use strict';

(function () {

  const quantityEdit = {

    bindings: {
      stock: '=',
      saleOrder: '='
    },

    templateUrl: 'app/domain/components/quantityEdit/quantityEdit.html',

    controller: function ($scope) {

      let vm = this;

      let positions = _.get(vm.saleOrder, 'positions');
      let position = _.find(positions, {articleId: vm.stock.articleId});

      let article = position.article;

      _.assign(vm, {

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

      $scope.$watchGroup(['vm.boxes', 'vm.bottles'], _.throttle(onQtyChange, 1500));

      /*
       Functions
       */

      function onQtyChange(newValues) {
        position.volume = newValues[0] * position.article.packageRel + newValues[1];
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
