'use strict';

(function () {

  angular.module('Models').run(function (Schema, DomainOption, $q, IOS) {

    const model = Schema.register({

      name: 'Campaign',

      relations: {

        hasOne: {
          CampaignGroup: {
            localField: 'campaignGroup',
            localKey: 'campaignGroupId'
          }
        },

        hasMany: {
          Action: {
            localField: 'actions',
            foreignKey: 'campaignId'
          },
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

      methods: {},

      computed: {

        teamName: ['name', teamNameFn],
        title: ['name', titleFn]

      },

      omit: ['photoCount', 'showAllPhotos'],

      meta: {

        findByVariantId(id) {
          if (!id) {
            return $q.resolve(null);
          }

          let where = { variants: { like: `%${id}%` } };

          if (!IOS.isIos()) {
            where = { 'variants.id': { '==': id } };
          }

          return model.findAll({ where })
            .then(_.first);
        },

        filterByGroup(campaignGroup) {

          let where = {
            dateB: {
              '<=': campaignGroup.dateE
            },
            dateE: {
              '>=': campaignGroup.dateB
            }
          };

          if (DomainOption.hasInactiveActions()) {
            where.isActive = { '==': true };
          }

          return { where };

        },

        findWithPictures(campaignGroup) {

          const { CampaignPicture, Action } = Schema.models();

          return model.findAll(model.meta.filterByGroup(campaignGroup))
            .then(campaigns => {
              const items = _.filter(campaigns, ({ discount }) => !discount);
              const campaignIds = _.map(items, 'id');
              return CampaignPicture.findByMany(campaignIds, { field: 'campaignId' })
                .then(() => Action.findByMany(campaignIds, { field: 'campaignId' }))
                .then(() => _.orderBy(items, 'name'));
            })

        },

        label: {
          accusative: 'акцию'
        }

      }

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
