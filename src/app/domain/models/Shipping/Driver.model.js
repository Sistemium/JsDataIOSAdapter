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
          let m = name.match(/^[^ ]+[ ]+./);
          return m ? (m[0] + '.') : null;
        }],

        mobileNumber: ['phone', function (phone) {

          let res = _.replace(_.trim(_.first(_.split(phone, ','))), /[^0-9]/g, '');

          if (!res) return null;

          if (res[0] === '8') {
            res = res.substring(1);
          }

          return res.replace(/(\d{3})(\d{3})(\d{4})/,(x,a,b,c) => '+7(' + a + ')' + b + '-' +c);
          // return `+7${res}`;

        }]

      }

    });

  }]);

})();
