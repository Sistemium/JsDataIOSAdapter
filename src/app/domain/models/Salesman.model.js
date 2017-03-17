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
          // SalesmanOutletRestriction: {
          //   localField: 'salesmanOutletRestrictions',
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
          var m = name.match(/^[^ ]+ [^ ]+/);
          return m ? m[0] : null;
        }],
        tinyName: ['name', function (name) {
          var m = name.match(/^[^ ]+[ ]+./);
          return m ? (m[0] + '.') : null;
        }],
        initials: ['name', function (name) {
          var m = name.match(/[А-Я]/g);
          return m ? (m[0] + '' + m[1]) : null;
        }]
      },

      getCurrent: function () {
        return;
      }

    });

  });

})();
