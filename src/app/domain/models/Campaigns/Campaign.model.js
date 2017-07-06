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
        title: ['name', titleFn]

      },

      omit: ['photoCount', 'showAllPhotos']

    });

    function teamNameFn(name) {
      return _.toUpper(getTeamName(name));
    }

    function titleFn(name) {

      let title = _.last(name.match(/[^ ]+ (.*)/)) || name;

      return _.upperFirst(title);

    }

    function getTeamName(name) {
      let res = _.first(name.match(/^[^ ]+/)) || 'Прочее';
      return _.replace(res, /[^A-я]/g, '') || 'Прочее';
    }


  });

})();
