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

      },

      computed: {
        shortName: ['name', shortName]
      }

    });

    function shortName(name) {
      return _.last(name.match(/\((.*)\)/));
    }

  });

})();
