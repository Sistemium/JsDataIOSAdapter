(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'CampaignsPriority',

      relations: {

        hasMany: {},

      },

      meta: {}

    });

  });

})();
