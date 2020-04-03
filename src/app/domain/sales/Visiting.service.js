(function () {

  angular.module('Sales').service('Visiting', Visiting);

  function Visiting(Schema, $q, moment) {

    const CONFIGURATION_TYPE_VISIT = { type: 'visit-task' };
    const { Visit, Configuration } = Schema.models();
    const { VisitQuestionSet, VisitAnswer, VisitQuestion } = Schema.models();

    const RULES = [configRuleDate];

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
          Configuration.findAll(CONFIGURATION_TYPE_VISIT),
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
        return _.find(configs, matchesConfiguration(context));
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

        if (isMissingRequiredPhoto(visit, configuration)) {
          return 'Требуется фото-отчет';
        }

        return false;

      },

    };

    function matchesConfiguration(context) {
      return configuration => !_.find(RULES, rule => !rule(context)(configuration));
    }

    function configRuleDate(context) {
      return ({ dateB, dateE }) => context.date >= dateB && context.date <= dateE;
    }

    function isMissingRequiredPhoto(visit, configuration) {
      const isRequired = _.get(configuration, 'rules.required.photo');
      return isRequired && !_.get(visit, 'photos.length');
    }

  }

})();
