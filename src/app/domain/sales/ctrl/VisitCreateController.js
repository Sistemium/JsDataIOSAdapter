'use strict';

(function () {

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth, IOS) {

    var Visit = Schema.model('Visit');
    var VQS = Schema.model('VisitQuestionSet');
    var VQ = Schema.model('VisitQuestion');
    var VA = Schema.model('VisitAnswer');
    var Location = Schema.model('Location');

    var date = moment().format('YYYY-MM-DD');
    var id = $state.params.visitId;
    var outletId = $state.params.id;
    var answersByQuestion = {};

    var salesman = SalesmanAuth.getCurrentUser();

    var vm = this;

    angular.extend(vm, {

      buttons: [
        {label: id ? 'Отмена' : 'Отменить', clickFn: 'goBack'},
        {label: id ? 'Сохранить' : 'Завершить', clickFn: 'save', class: 'btn-success'}
      ],

      goBack: function () {
        $state.go('^');
      },

      changeAnswer: function (qst, data) {
        var ans = answersByQuestion[qst.id] || VA.inject({visitId: vm.visit.id, questionId: qst.id});
        if (qst.dataType.code === 'boolean') {
          ans.data = data && '1' || '0';
        } else if (qst.dataType.code === 'date') {
          ans.data = data && moment(data).format('YYYY/MM/DD') || null;
        } else {
          ans.data = data;
        }
        answersByQuestion[qst.id] = ans;
      },

      save: function () {
        vm.busy = $q(function (resolve, reject) {
          Visit.save(vm.visit)
            .then(function () {
              $q.all(_.map(answersByQuestion, function (ans) {
                return VA.save(ans);
              }))
                .then(function () {
                  resolve();
                  $state.go('^');
                }, reject);
            }, reject);
        });
      }

    });

    vm.importData = function (name) {
      return function (data) {
        return (vm[name] = data);
      };
    };

    vm.busy = $q.all([
      VQS.findAllWithRelations({isEnabled: true})('VisitQuestionGroup')
        .then(vm.importData('questionSets')),
      VQ.findAllWithRelations()('VisitQuestionDataType')
    ]).then(function () {

      if (id) {
        vm.busy = Visit.find(id)
          .then(vm.importData('visit'))
          .then(function (visit) {
            VA.findAll({
              visitId: visit.id
            }).then(function () {
              var index = _.groupBy(visit.answers, 'questionId');

              answersByQuestion = _.mapValues(index, function (ansArray) {
                return ansArray[0];
              });

              vm.answers = _.mapValues(answersByQuestion, function (ans) {
                return _.get(ans,'question.dataType.code') === 'date' && ans.data ?
                  moment(ans.data, 'YYYY-MM-DD').toDate() : ans.data;
              });

            });
          });
      } else {

        if (IOS.isIos()) {
          IOS.checkIn(100).then(function(res){
            Location.inject(res);
            vm.visit.checkInLocationId = res.id;
          });
        }

        vm.answers = {};
        vm.visit = Visit.inject({
          date: date,
          outletId: outletId,
          salesmanId: salesman.id
        });
      }

    });

    $scope.$on('$destroy', function () {

      if (!Visit.lastSaved(vm.visit)) {
        Visit.eject(vm.visit);
        _.each(answersByQuestion, function (ans) {
          VA.eject(ans);
        });
      }

    });

  }

  angular.module('webPage')
    .controller('VisitCreateController', VisitCreateController);

})();
