(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Action',

      relations: {

        belongsTo: {
          Campaign: {
            localField: 'campaign',
            localKey: 'campaignId'
          },
          CampaignsPriority: {
            localField: 'priority',
            localKey: 'priorityId'
          },
        },

        hasMany: {},

      },

      meta: {}

    });

  });

})();
