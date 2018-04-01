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
        }
      },

      computed: {
        shortName: ['name', shortNameFn],
        tinyName: ['name', tinyNameFn],
        initials: ['name', function (name) {
          let m = name.match(/[А-Я]/g);
          return m ? (m[0] + '' + m[1]) : null;
        }]
      },

      getCurrent: function () {
        return;
      }

    });

    function etcFn(name) {
      let etc = name.match(/\(.+\)/);
      return etc ? etc[0] : '';
    }

    function shortNameFn(name) {

      let m = name.match(/^[^ ]+ [^ ]+/);

      if (!m) {
        return name;
      }

      let res = [m[0]];

      let etc = etcFn(name);

      if (etc) {
        res.push(etc);
      }

      return res.join(' ');
    }

    function tinyNameFn(name) {
      let m = name.match(/^[^ ]+[ ]+./);
      if (!m) {
        return name;
      }
      let res = [m[0]+'.'];
      let etc = etcFn(name);

      if (etc) {
        res.push(etc);
      }

      return res.join(' ');
    }


  });

})();
