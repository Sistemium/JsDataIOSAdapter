'use strict';

(function () {

  const REQUIRED_ACCURACY = 150;

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth, geolib, Helpers, mapsHelper) {

    const {ConfirmModal, toastr, PhotoHelper, LocationHelper, saControllerHelper} = Helpers;
    const {yLatLng} = mapsHelper;

    const {Visit, Location} = Schema.models();
    const VQS = Schema.model('VisitQuestionSet');
    const VQ = Schema.model('VisitQuestion');
    const VA = Schema.model('VisitAnswer');

    const creatingMode = !!_.get($state, 'current.name').match(/\.visitCreate$/);

    let vm = saControllerHelper.setup(this, $scope);
    let buttons = [];

    vm.use({

      buttons: buttons,
      creatingMode: creatingMode,
      thumbnails: {},

      mapOptions: {
        avoidFractionalZoom: false,
        margin: 0,
        balloonAutoPanMargin: 300
      },

      showSalesman: SalesmanAuth.hasOptions,

      takePhoto,
      thumbnailClick,
      goBack,
      changeAnswer,
      save,
      mapClick: () => vm.visitMapPopoverOpen = false,
      deleteVisit

    });


    let date = moment().format();
    let visitId = $state.params.visitId;
    let outletId = $state.params.id;

    let rootState = _.first($state.current.name.match(/sales\.[^.]+/)) || 'sales.territory';

    let answersByQuestion = {};


    /*
     Init
     */

    if (creatingMode) {
      buttons.push({
        // label: 'Отмена',
        // class: 'btn-default',
        fa: 'glyphicon glyphicon-trash',
        clickFn: 'deleteVisit'
      });
      buttons.push({
        label: !creatingMode ? 'Готово' : 'Завершить',
        clickFn: 'save',
        class: 'btn-success',
        isDisabled: function () {
          return creatingMode && !_.get(vm, 'visit.checkInLocationId') || vm.saving;
        }
      });
    }

    vm.importData = function (name) {
      return function (data) {
        return (vm[name] = data);
      };
    };

    if (visitId) {

      vm.busy = $q.all([
        VQS.findAllWithRelations({isEnabled: true})('VisitQuestionGroup')
          .then(vm.importData('questionSets')),
        VQ.findAllWithRelations()('VisitQuestionDataType')
      ]).then(() => {
        return Visit.find(visitId)
          .then(vm.importData('visit'))
          .then(function (visit) {
            Visit.loadRelations(visit, ['Location', 'VisitPhoto'])
              .then(() => {
                _.each(visit.photos, importThumbnail);
                return visit;
              })
              .then(initMap);
            return visit;
          })
          .then(visit => VA.findAll({
            visitId: visit.id
          }));
      })
        .then(postRefresh)
        .catch(err => console.error(err));

    } else {

      SalesmanAuth.watchCurrent($scope, salesman => {

        if (!salesman) return;

        vm.visit = Visit.inject({
          date: date,
          outletId: outletId,
          salesmanId: salesman.id
        });

        vm.busy = getLocation()
          .then(res => {

            // If use went out to another state before the promise is resolved
            if ($scope['$$destroyed']) return;

            vm.visit.checkInLocationId = res.id;

            let outletLocation = _.get(vm.visit, 'outlet.location');

            if (outletLocation) {
              let distance = geolib.getDistance(outletLocation, res);
              toastr.success(
                `Расстояние до точки ${Math.round(distance)} м.`,
                'Успешное начало визита',
                {timeOut: 10000}
              );
            }

            return Visit.save(vm.visit)
              .then(visit => {
                $state.go('.', {visitId: visit.id})
              });

          })
          .catch(err => {

            if ($scope['$$destroyed']) return;

            console.error(err);
            toastr.error(angular.toJson(err), 'Не удалось определить местоположение визита');
            $state.go('^');

          });
      })

    }

    /*
     Listeners
     */

    $scope.$on('$destroy', function () {

      if (creatingMode) {
        if (!Visit.lastSaved(vm.visit)) {
          Visit.eject(vm.visit);
          _.each(answersByQuestion, function (ans) {
            VA.eject(ans);
          });
        }
      }

    });

    /*
     Functions
     */

    function takePhoto() {
      return PhotoHelper.takePhoto('VisitPhoto', {visitId: vm.visit.id}, vm.thumbnails);
    }

    function importThumbnail(picture) {
      return PhotoHelper.importThumbnail(picture, vm.thumbnails);
    }

    function thumbnailClick(pic) {

      let resourceName = 'VisitPhoto';
      let src = vm.thumbnails[pic.id];
      let title = vm.visit.outlet.partner.shortName + ' (' + vm.visit.outlet.address + ')';

      return PhotoHelper.thumbnailClick(resourceName, pic, src, title);

    }

    function initMap(visit) {

      let checkIn = _.get(visit, 'checkInLocation') || _.get(vm, 'visit.checkInLocation');

      if (!checkIn) {
        return;
      }

      vm.map = {
        yaCenter: yLatLng(checkIn),
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

    function getLocation() {

      vm.locating = true;
      vm.busyMessage = 'Получение геопозиции…';

      return LocationHelper.getLocation(REQUIRED_ACCURACY, _.get(vm, 'visit.id'), 'Visit')
        .then(function (location) {

          vm.locating = false;

          if (location.horizontalAccuracy <= REQUIRED_ACCURACY) {

            return Location.inject(location);

          } else {

            var message = 'Требуемая точность — ' + REQUIRED_ACCURACY + 'м. ';
            message += 'Достигнутая точность — ' + location.horizontalAccuracy + 'м.';
            return ConfirmModal.showMessageAskRepeat(message, getLocation, $q.reject());

          }

        });

    }

    function quit() {
      return $scope['$$destroyed'] || goBack();
    }

    function goBack() {

      if (rootState == 'sales.visits') {
        return $state.go(rootState);
      }

      $state.go('^');

    }

    function changeAnswer(qst, data) {

      let ans = answersByQuestion[qst.id] || VA.inject({visitId: vm.visit.id, questionId: qst.id});

      if (qst.dataType.code === 'boolean') {
        ans.data = data && '1' || '0';
      } else if (qst.dataType.code === 'date') {
        ans.data = data && moment(data).format('YYYY/MM/DD') || null;
      } else {
        ans.data = data;
      }

      answersByQuestion[qst.id] = ans;
      VA.save(ans);

    }

    function save() {

      vm.saving = true;

      function done() {
        vm.saving = false;
      }

      vm.busy = $q(function (resolve, reject) {

        if (creatingMode) {

          getLocation()
            .then(function (checkOutLocation) {
              vm.visit.checkOutLocationId = checkOutLocation.id;
              Visit.save(vm.visit)
                .then(function (visit) {
                  var cts = _.get(visit, 'checkInLocation.deviceCts') || visit.deviceCts;
                  var diff = moment(visit.checkOutLocation.deviceCts).diff(cts, 'seconds');
                  toastr.info(diff > 60 ? Math.round(diff / 60) + ' мин' : diff + ' сек', 'Визит завершен');
                  resolve(visit);
                  quit();
                }, function (err) {
                  reject(err);
                  toastr.error(angular.toJson(err), 'Не удалось сохранить визит');
                });
            }, function (err) {
              reject(err);
              toastr.error(angular.toJson(err), 'Не удалось определить местоположение');
            });

        } else {
          Visit.save(vm.visit)
            .then(resolve, reject)
            .then(quit);
        }

      }).then(done, done);

    }

    function deleteVisit() {
      if (!Visit.lastSaved(vm.visit)) {
        return quit();
      }
      ConfirmModal.show({
        text: 'Действительно удалить запись об этом визите?'
      })
        .then(function () {
          Visit.destroy(vm.visit)
            .then(quit);
        })
      ;
    }


    function postRefresh() {

      let index = _.groupBy(vm.visit.answers, 'questionId');

      answersByQuestion = _.mapValues(index, function (ansArray) {
        return ansArray[0];
      });

      vm.answers = _.mapValues(answersByQuestion, function (ans) {

        if (!ans.data) {
          return ans.data;
        }

        switch (_.get(ans, 'question.dataType.code')) {
          case 'date': {
            return moment(ans.data, 'YYYY-MM-DD').toDate();
          }
          case 'boolean': {
            return (ans.data == '1');
          }
        }

        return ans.data;

      });

    }


  }

  angular.module('webPage')
    .controller('VisitCreateController', VisitCreateController);

})();
