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

      }

    });

    function teamNameFn(name) {
      return _.toUpper(getTeamName(name));
    }

    function titleFn(name) {

      let nameArr = name.split(' ');

      let regExp = new RegExp(getTeamName(name, 'i'));

      _.each(nameArr, function (item, idx) {
        if (item.match(regExp)) {
          nameArr = nameArr.slice(idx + 1);
          return false;
        }
      });

      return _.upperFirst(nameArr.join(' '));

    }

    function getTeamName(name) {
      return _.first(name.match(/[^.| ! :]+/));
    }


  });

})();
