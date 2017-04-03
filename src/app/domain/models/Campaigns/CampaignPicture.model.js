'use strict';

(function () {

  angular.module('Models').run(function (Schema, PhotoHelper) {

    const config = PhotoHelper.setupModel({

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

    Schema.register(config);

  });

})();
