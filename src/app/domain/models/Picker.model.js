'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      var currentPicker;

      var Picker = Schema.register ({

        name: 'Picker',

        relations: {
          hasMany: {
            PickingOrder: {
              localField: 'pickingOrders',
              foreignKey: 'picker'
            }
          }
        },

        computed: {
          shortName: ['name', function (name) {
            var names = name.match (/(^[^ ]*) (.*$)/);
            return names[1] + ' ' + names[2][0] + '.';
          }]
        },

        getCurrent: function () {
          return currentPicker;
        },

        logout: function () {
          currentPicker = undefined;
          Schema.model ('PickingOrder').ejectAll();
          Picker.ejectAll();
        },

        login: function (code, password) {

          return Picker.findAll({
            code: code,
            password: password
          },{
            bypassCache:true
          }).then (function (pickers){
            if (pickers.length) {
              return (currentPicker = pickers[0]);
            } else {
              return false;
            }
          });

        }

      });

    });

})();
