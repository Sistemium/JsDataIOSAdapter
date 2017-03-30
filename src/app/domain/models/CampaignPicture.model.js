'use strict';

(function () {

  angular.module('Models').run(function(Schema) {

    Schema.register({

      name: 'CampaignPicture',

      relations: {
        hasOne: {
          Campaign: {
            localField: 'campaign',
            localKey: 'campaignId'
          }
        }
      }

    });

  });

})();
