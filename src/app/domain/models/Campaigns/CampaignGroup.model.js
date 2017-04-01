'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'CampaignGroup',

      relations: {

        hasMany: {
          Campaign: {
            localField: 'campaigns',
            foreignKey: 'campaignGroupId'
          }
        }

      }

    });

  });

})();