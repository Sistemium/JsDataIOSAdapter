'use strict';

(function () {

  angular.module('Models').run((Schema) => {

    Schema.register({

      name: 'UncashingPlace',

      relations: {
        hasMany: {
          // Uncashing: {
          //   localField: 'uncashings',
          //   localKey: 'uncashingPlaceId'
          // }
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
