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
        },

        hasMany: {
          CampaignPicture: {
            localField: 'campaignPictures',
            foreignKey: 'campaignId'
          },
          PhotoReport: {
            localField: 'photoReports',
            foreignKey: 'campaignId'
          }
        }

      },

      computed: {

        teamName: ['name', teamNameFn],
        title: ['name', 'teamName', titleFn]

      }

    });

    function titleFn(name, teamName) {
      return _.trim(_.replace(name, teamName, ''));
    }

    function teamNameFn(name) {
      return _.first(name.match(/[^ ]+/));
    }

  });

})();
