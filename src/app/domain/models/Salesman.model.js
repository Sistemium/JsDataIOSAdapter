'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Salesman',

      labels: {
        multiple: 'Торговые представители',
        single: 'Торговый представитель'
      },

      relations: {
        hasMany: {
          // SaleOrder: {
          //   localField: 'saleOrders',
          //   foreignKey: 'salesmanId'
          // },
          PrePreOrder: {
            localField: 'prePreOrders',
            foreignKey: 'salesmanId'
          }
        }
      },

      computed: {
        shortName: ['name', function (name) {
          var m = name.match (/^[^ ]+ [^ ]+/);
          return m ? m[0] : null;
        }],
        tinyName: ['name', function (name) {
          var m = name.match (/^[^ ]+[ ]+./);
          return m ? (m[0]+'.') : null;
        }]
      },

      getCurrent: function () {
        return;
      }

    });

  });

})();
