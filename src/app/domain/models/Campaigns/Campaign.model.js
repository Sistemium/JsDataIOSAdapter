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

        teamName: ['name', 'priorityId', teamNameFn],
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
            },
            source: {
              '==': 'old',
            },
          };

          if (DomainOption.hasInactiveActions()) {
            where.isActive = { '==': true };
          }

          return { where };

        },

        findWithPictures(campaignGroup) {

          const { CampaignPicture, Action, CampaignsPriority } = Schema.models();

          return model.findAll(model.meta.filterByGroup(campaignGroup), { bypassCache: true })
            .then(campaigns => {
              const items = _.filter(campaigns, ({ discount }) => !discount);
              const campaignIds = _.map(items, 'id');
              return CampaignPicture.findByMany(campaignIds, { field: 'campaignId' })
                .then(() => Action.findByMany(campaignIds, { bypassCache: true, field: 'campaignId' }).catch(_.noop))
                .then(() => CampaignsPriority.findAll().catch(_.noop))
                .then(() => _.orderBy(items, 'name'));
            })

        },

        teamsWithPriorities(campaigns, { dateB, dateE }) {

          const { CampaignsPriority } = Schema.models();
          const teams = _.map(_.groupBy(campaigns, 'teamName'), (campaigns, name) => {
            return {
              name,
              campaigns: _.orderBy(campaigns, 'name'),
            };
          });

          // const priorityCampaigns = _.filter(vm.campaigns, 'priorityId');
          const priorityMap = _.map(campaigns, ({ actions }) => _.filter(actions, 'priorityId'));
          const priorityActions = _.filter(_.flatten(priorityMap));

          const actionGroups = _.groupBy(priorityActions, 'priorityId');
          const groupedActions = _.map(actionGroups, (actions, priorityId) => {
            const priority = CampaignsPriority.get(priorityId) || {};
            return {
              id: priorityId,
              name: priority.name,
              title: priority.name,
              dateB,
              dateE,
              ord: priority.ord,
              actions,
            };
          });

          const mz = {
            // TODO: un-hardcode name
            name: 'Маркетинговые задачи',
            title: 'Маркетинговые задачи',
            dateB,
            dateE,
            actions: _.orderBy(priorityActions, ({ priority }) => priority.ord),
            groups: _.orderBy(groupedActions, 'ord'),
          };

          const res = [];

          if (DomainOption.hasMZ()) {
            res.push({
              cls: 'priorities',
              name: 'Задачи',
              campaigns: [mz],
              icon: 'glyphicon glyphicon-flag'
            });
          }

          Array.prototype.push.apply(res, teams);

          return res;

        },

        label: {
          accusative: 'акцию'
        }

      }

    });

    function teamNameFn(name, priorityId) {
      return _.toUpper(getTeamName(name, priorityId));
    }

    function titleFn(name) {

      const title = DomainOption.hasCampaignTeams() && _.last(name.match(/[^ ]+ (.*)/)) || name;

      return _.upperFirst(title);

    }

    function getTeamName(name, priorityId) {
      return (DomainOption.hasCampaignTeams() || priorityId) && _.first(name.match(/^[^ ]+/)) || 'Основные';
    }


  });

})();
