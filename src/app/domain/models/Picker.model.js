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

        getCurrent: function () {
          return currentPicker;
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
