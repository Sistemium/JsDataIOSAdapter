(function () {

  angular.module('Models')
    .run(function (Schema, PhotoHelper) {

      const config = PhotoHelper.setupModel({

        name: 'PossibleOutletPhoto',

        relations: {
          belongsTo: {
            PossibleOutlet: {
              localField: 'possibleOutlet',
              localKey: 'possibleOutletId',
            },
          },
        },

        methods: {},

      });

      Schema.register(config);

    });


})();
