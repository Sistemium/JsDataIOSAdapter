'use strict';

(function () {

  angular.module('jsd').run(['Schema', function (Schema) {

    Schema.register({

      name: 'Driver',

      labels: {
        multiple: 'Водители',
        single: 'Водитель'
      },

      relations: {
        hasMany: {
          Shipment: {
            localField: 'shipments',
            foreignKey: 'driverId'
          }
        }
      },

      computed: {
        tinyName: ['name', function (name) {
          var m = name.match(/^[^ ]+[ ]+./);
          return m ? (m[0] + '.') : null;
        }],
      }

    });

  }]);

})();
