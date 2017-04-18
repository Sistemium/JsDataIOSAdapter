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
      let tName = _.first(name.match(/[^ ]+/));
      return _.toUpper(_.replace(tName, /\.+/, ''));
    }

    function titleFn(name) {
      return _.upperFirst(_.trim(_.replace(name, (name.split(' ').shift()), '')));
    }

  });

})();
