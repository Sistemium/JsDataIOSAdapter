(function () {

  angular.module('Sales').service('Visiting', Visiting);

  const getPriority = ({ rules }) => rules.priority;

  function Visiting(Schema, $q, moment) {

    const CONFIGURATION_TYPE_VISIT = { type: 'visit-task' };
    const { Visit, Configuration, Article } = Schema.models();
    const { VisitQuestionSet, VisitAnswer, VisitQuestion } = Schema.models();

    const RULES = [configRuleDate, configRulePartner];

    return {

      findVisitById(visitId) {
        return Visit.find(visitId)
          .then(visit => {
            return Visit.loadRelations(visit, ['Location', 'VisitPhoto'])
              .then(() => VisitAnswer.findAll({ visitId }))
              .then(() => visit);
          });
      },

      loadQuestionsData() {
        return $q.all([
          VisitQuestionSet.findAllWithRelations({ isEnabled: true })('VisitQuestionGroup'),
          VisitQuestion.findAllWithRelations()('VisitQuestionDataType'),
          Configuration.findAll(CONFIGURATION_TYPE_VISIT)
            .catch(_.noop),
        ]).then(([data]) => data);
      },

      saveVisit(props) {
        return props.id ? Visit.save(props) : Visit.create(props);
      },

      visitTime(visit) {
        const cts = _.get(visit, 'checkInLocation.deviceCts') || visit.deviceCts;
        const diff = moment(visit.checkOutLocation.deviceCts).diff(cts, 'seconds');
        return diff > 60 ? Math.round(diff / 60) + ' мин' : diff + ' сек';
      },

      visitConfiguration(visit) {
        const context = _.pick(visit, ['outlet', 'date']);
        const configs = Configuration.filter(CONFIGURATION_TYPE_VISIT);
        const matching = _.filter(configs, matchesConfiguration(context));
        return _.orderBy(matching, [getPriority, 'ts'], ['desc', 'desc'])[0];
      },

      questionsMap(answersByQuestion) {
        return _.mapValues(answersByQuestion, ans => {

          if (!ans.data) {
            return ans.data;
          }

          switch (_.get(ans, 'question.dataType.code')) {
            case 'date': {
              return moment(ans.data, 'YYYY-MM-DD').toDate();
            }
            case 'boolean': {
              return ans.data === '1';
            }
          }

          return ans.data;

        });
      },

      hasMissingRequirements(visit, configuration) {

        const missingPhotos = isMissingRequiredPhoto(visit, configuration);

        if (!missingPhotos) {
          return false;
        }

        return $q.when(missingPhotos);

      },

      priceGatheringArticleIds(configuration, { prices }) {
        const { articleIds = [] } = _.get(configuration, 'rules.priceGathering') || {};
        Array.prototype.push.apply(articleIds, Object.keys(prices || {}));
        return _.uniq(articleIds);
      },

      findPriceGatheringData(configuration, visit) {

        const articleIds = this.priceGatheringArticleIds(configuration, visit) || [];

        return $q((resolve, reject) => {

          const toLoadArticles = _.filter(articleIds, id => !Article.get(id));

          Article.findByMany(toLoadArticles)
            .then(() => {
              resolve({
                articleIds,
                articles: _.orderBy(Article.getAll(articleIds), 'sortName'),
              });
            }, reject);

        });
      },

    };

    function matchesConfiguration(context) {
      return configuration => !_.find(RULES, rule => !rule(context)(configuration));
    }

    function configRuleDate(context) {
      return ({ dateB, dateE }) => context.date >= dateB && context.date <= dateE;
    }

    function configRulePartner(context) {
      return ({ rules: { partnerIds } = {} }) => {
        return !partnerIds || partnerIds.indexOf(context.outlet.partnerId) > -1;
      };
    }

    function isMissingRequiredPhoto(visit, configuration) {
      const isRequired = _.get(configuration, 'rules.required.photo');
      if (!isRequired) {
        return false;
      }
      const { dateB, dateE } = configuration;
      const { count = 1, msg = 'Требуется фото-отчет' } = isRequired;
      const doneCount = _.get(visit, 'photos.length') || 0;
      if (doneCount >= count) {
        return false;
      }
      const where = {
        date: {
          '>=': dateB,
          '<=': dateE,
        },
        outletId: { '==': visit.outletId },
      };
      return Visit.findAllWithRelations({ where }, { bypassCache: true })('VisitPhoto')
        // .then(visits => _.filter(visits, ({ date }) => date <= dateE))
        .then(visits => {
          const pastCount = _.sumBy(visits, ({ photos }) => _.get(photos, 'length') || 0);
          return (pastCount < count) && msg;
        });
    }

  }

})();
