'use strict';

(function () {

    angular.module('Models').service('Picker', function (Schema, SoundSynth, toastr) {

      let currentPicker;

      const Picker = Schema.register ({

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
          shortName: ['name', name => {
            const names = name.match (/(^[^ ]*) (.*$)/);
            return names[1] + ' ' + names[2][0] + '.';
          }]
        },

        getCurrent: () => {
          return currentPicker;
        },

        setCurrentById: id => {
          return Picker.find(id).then(p => {
            //SoundSynth.say(p.name);
            return (currentPicker = p);
          }, res => {
            toastr.error(angular.toJson(res),'Ошибка регистрации сборщика');
          });
        },

        logout: () => {
          currentPicker = undefined;
          Schema.model ('PickingOrder').ejectAll();
          Picker.ejectAll();
        },

        login: (code, password) => {

          return Picker.findAll({
            code: code,
            password: password
          },{
            bypassCache:true
          }).then(pickers => {
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
