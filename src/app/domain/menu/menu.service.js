'use strict';

(function () {

    angular.module('webPage').service('Menu', function () {

      return {
        root: function () {
          return {

            title: 'Home',
            state: 'home',

            items: [{
              title: 'Playground',
              state: 'playground'
            },{
              title: 'Picking',
              state: 'picking.orderList'
            }]

          };
        }
      }

    });

})();
