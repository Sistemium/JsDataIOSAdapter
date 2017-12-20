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
      },

      meta: {
        label: {
          accusative: 'период'
        },
        filterActual
      }

    });

    function shortName(name) {
      return _.last(name.match(/\((.*)\)/));
    }

    function filterActual(filter) {

      let dateB = moment().add(-7, 'months').format();
      let dateE = moment().add(2, 'months').format();

      return _.assign({
        where: {
          dateB: {
            '>=': dateB
          },
          dateE: {
            '<=': dateE
          }
        }
      }, filter);

    }

  });

})();
