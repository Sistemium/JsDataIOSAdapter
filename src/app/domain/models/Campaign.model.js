'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Campaign',

      relations: {
        hasOne: {
          CampaignGroup: {
            localField: 'campaignGroup',
            localKey: 'campaignGroupId'
          }
        }
      }

    });

  });

})();
