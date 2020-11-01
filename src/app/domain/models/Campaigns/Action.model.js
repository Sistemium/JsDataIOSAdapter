(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Action',

      relations: {

        belongsTo: {
          Campaign: {
            localField: 'campaign',
            localKey: 'campaignId'
          }
        },

        hasMany: {},

      },

      meta: {}

    });

  });

})();
