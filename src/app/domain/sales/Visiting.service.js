(function () {

  angular.module('Sales').service('Visiting', Visiting);

  function Visiting(Schema, $q, moment) {

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

      saveVisit(props) {
        return Visit.save(props);
      },

      visitTime(visit) {
        const cts = _.get(visit, 'checkInLocation.deviceCts') || visit.deviceCts;
        const diff = moment(visit.checkOutLocation.deviceCts).diff(cts, 'seconds');
        return  diff > 60 ? Math.round(diff / 60) + ' мин' : diff + ' сек';
      },

    };

  }

})();
