'use strict';

(function () {

    angular.module('Models').service('Picker', function (Schema, SoundSynth, toastr) {

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

        setCurrentById: function (id) {
          return Picker.find(id).then(function(p){
            //SoundSynth.say(p.name);
            return (currentPicker = p);
          },function (res) {
            toastr.error(angular.toJson(res),'Ошибка регистрации сборщика');
          });
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

      return Picker;

    });

})();
