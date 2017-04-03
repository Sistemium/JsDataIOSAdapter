'use strict';

(function () {

  angular.module('Models').run((Schema) => {

    Schema.register({

      name: 'Uncashing',

      relations: {
        hasOne: {
          UncashingPlace: {
            localField: 'uncashingPlace',
            localKey: 'uncashingPlaceId'
          }
        },
        hasMany: {
          Cashing: {
            localField: 'cashings',
            foreignKey: 'uncashingId'
          }
        }
      },

      defaultValues: {
      },

      watchChanges: false,

      meta: {
      },

      methods: {
      }

    });

  });

})();
