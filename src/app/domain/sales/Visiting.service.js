(function () {

  angular.module('Sales').service('Visiting', Visiting);

  function Visiting(Schema, $q) {

    const { Visit } = Schema.models();
    const { VisitQuestionSet, VisitAnswer, VisitQuestion } = Schema.models();

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
          VisitQuestion.findAllWithRelations()('VisitQuestionDataType')
        ]).then(([data]) => data);
      },

    };

  }

})();
