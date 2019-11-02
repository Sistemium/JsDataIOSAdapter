(function () {

  angular.module('Models')
    .run(function (Schema) {

    Schema.register({

      name: 'PossibleOutlet',

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId',
          },
          Location: {
            localField: 'location',
            localKey: 'locationId',
          },
        },
        hasMany: {
          PossibleOutletPhoto: {
            localField: 'photos',
            foreignKey: 'possibleOutletId',
          },
        },
      },

      methods: {},

    });

  });

})();
