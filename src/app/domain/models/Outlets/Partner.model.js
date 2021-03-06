'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Partner',

      labels: {
        multiple: 'Контрагенты',
        single: 'Контрагент'
      },

      // TODO check if it's not breaking editing
      watchChanges: false,

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
          if (!name) {
            return;
          }
          name = name.replace(/"[КKРP]"/i,'');
          let match = name.match(/"([^"]*[^ ])"/) || name.match(/"([^"]*[^ "]*)"/);
          return match ? match[1] : name;
        }]
      },

      methods: {
        hasExclusions
      }

    });

    function hasExclusions() {
      return this.allowAnyVolume ||
        this.allowLowTotal ||
        this.allowAnyTotal ||
        this.allowNoCharges ||
        this.allowNoDocDiscounts;
    }


  });

})();
