'use strict';

(function () {

  angular.module('webPage')
    .component('pickingArticle', {

      bindings: {
        picking: '<',
        orders: '<',
        onDone: '&'
      },

      templateUrl: 'app/domain/picking/pickingArticle/pickingArticle.html',
      controller: PickingArticleController,
      controllerAs: 'vm'

    });

  function PickingArticleController() {

    let vm = this;

    _.assign(vm, {

      $onInit,
      doneClick

    });


    /*
    Functions
     */

    function $onInit() {

      const { picking, orders } = vm;

      _.assign(vm, {
        article: _.get(picking, 'article'),
        ordered: _.map(orders, order => {

          return {
            id: order.id,
            ndoc: order.ndoc,
            order: order,
            position: picking.position(order),
            volume: picking.orderVolume(order)
          };

        })
      });

    }


    function doneClick() {

      vm.picking.updatePicked();
      vm.onDone();

    }

  }

})();
