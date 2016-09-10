'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Partner',

      labels: {
        multiple: 'Контрагенты',
        single: 'Контрагент'
      },

      relations: {
        hasOne: {
          LegalForm: {
            localField: 'legalForm',
            localKey: 'legalFormId'
          }

        },
        hasMany: {
          Outlet: {
            localField: 'outlets',
            foreignKey: 'partnerId'
          }
        }
      },

      computed: {
        shortName: ['name',function (name) {
          var match = name.match(/"([^"]*[^ ])"/) || name.match(/"([^"]*[^ "]*)"/);
          return match ? match[1] : name;
        }]
      }

    });

  });

})();
