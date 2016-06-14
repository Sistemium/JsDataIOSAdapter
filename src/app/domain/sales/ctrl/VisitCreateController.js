'use strict';

(function () {

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth, IOS, mapsHelper, ConfirmModal) {

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
    var creatingMode = !id;

    var yaLatLng = mapsHelper.yLatLng;

    function initMap (visit) {

      var checkIn = _.get(visit,'checkInLocation') || _.get(vm, 'visit.checkInLocation');

      if (!checkIn) {
        return;
      }

      vm.map = {
        yaCenter: yaLatLng(checkIn),
        afterMapInit: function () {

          vm.startMarker = mapsHelper.yMarkerConfig({
            id: 'checkIn',
            location: checkIn,
            content: 'Начало визита',
            hintContent: moment(checkIn.deviceCts + ' Z').format('HH:mm')
          });

        }
      };

    }

    function getLocation () {
      vm.locating = true;
      return IOS.checkIn(100,{
        ownerXid: _.get(vm, 'visit.id'),
        target: 'Visit'
      }).then(function(res){
        vm.locating = false;
        return Location.inject(res);
      });
    }

    function saveVisit (visit, resolve, reject) {

      return Visit.save(visit)
        .then(function () {

          var promises = _.map(answersByQuestion, function (ans) {
            return VA.save(ans);
          });

          $q.all(promises)
            .then(function () {
              resolve();
              $state.go('^');
            }, reject);

        }, reject);
    }

    angular.extend(vm, {

      buttons: [
        {label: id ? 'Отмена' : 'Отменить', clickFn: 'goBack'},
        {label: id ? 'Сохранить' : 'Завершить', clickFn: 'save', class: 'btn-success'}
      ],

      mapOptions: {
        avoidFractionalZoom: false,
        margin: 0,
        balloonAutoPanMargin: 300
      },

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

          if (creatingMode && IOS.isIos()) {

            getLocation().then(function(res){
              vm.visit.checkOutLocationId = res.id;
              saveVisit(vm.visit,resolve,reject);
            },function(err){
              console.error(err);
              saveVisit(vm.visit,resolve,reject);
            });

          } else {
            saveVisit(vm.visit,resolve,reject);
          }

        });
      },

      mapClick: function() {
        vm.popover = false;
      },

      deleteVisit: function () {
        ConfirmModal.show({
          text: 'Действительно удалить запись об этом визите?'
        })
          .then(function(){
            Visit.destroy(vm.visit)
              .then(function () {
                $state.go('^');
              });
          })
        ;
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
          .then(function(v){
            Visit.loadRelations(v,'Location')
              .then(initMap);
            return v;
          })
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

        vm.answers = {};
        vm.visit = Visit.inject({
          date: date,
          outletId: outletId,
          salesmanId: salesman.id
        });

        if (IOS.isIos()) {
          getLocation().then(function(res){
            vm.visit.checkInLocationId = res.id;
            initMap(res);
          },function(err){
            console.error(err);
            vm.locating = false;
          });
        }

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
