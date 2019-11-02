(function () {

  angular.module('Models')
    .run(function (Schema) {

    Schema.register({

      name: 'PossibleOutlet',

      relations: {
        belongsTo: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId',
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
