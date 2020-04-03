'use strict';

(function () {

  const REQUIRED_ACCURACY = 500;

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth,
                                 moment, geolib, Helpers, mapsHelper, Visiting) {

    const { ConfirmModal, toastr, PhotoHelper, LocationHelper, saControllerHelper } = Helpers;
    const { yLatLng } = mapsHelper;

    const { Visit, Location } = Schema.models();
    const { VisitAnswer } = Schema.models();

    const creatingMode = !!_.get($state, 'current.name').match(/\.visitCreate$/);

    let vm = saControllerHelper.setup(this, $scope);
    let buttons = [];

    vm.use({

      buttons,
      creatingMode,
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
      deleteVisit,

      importData(name) {
        return (data) => (vm[name] = data);
      },

    });


    let date = moment().format();
    let visitId = $state.params.visitId;
    let outletId = $state.params.id;

    let rootState = _.first($state.current.name.match(/sales\.[^.]+/)) || 'sales.territory';

    let answersByQuestion = {};

    let filterByOutletId = { outletId: outletId };

    vm.saleOrderFilter = _.assign({ 'x-order-by:': '-date' }, filterByOutletId);

    /*
     Init
     */

    if (creatingMode) {

      buttons.push({
        label: 'Отменить',
        // class: 'btn-default',
        // fa: 'glyphicon glyphicon-trash',
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

    if (visitId) {

      vm.busy = Visiting.loadQuestionsData()
        .then(vm.importData('questionSets'))
        .then(() => {
          return Visiting.findVisitById(visitId)
            .then(vm.importData('visit'))
            .then(visit => {
              _.each(visit.photos, importThumbnail);
              return visit;
            })
            .then(initMap);
        })
        .then(postRefresh)
        .catch(err => console.error(err));

    } else {

      onSalesman();

    }

    /*
     Listeners
     */

    function onSalesman() {

      const { visitSalesmanId } = $state.params;

      if (!visitSalesmanId) return;

      vm.visit = Visit.inject({
        date: date,
        outletId: outletId,
        salesmanId: visitSalesmanId,
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
              { timeOut: 10000 }
            );
          }

          return Visit.save(vm.visit)
            .then(visit => {
              $state.go('.', { visitId: visit.id })
            });

        })
        .catch(err => {

          if ($scope['$$destroyed']) return;

          console.error(err);
          toastr.error(angular.toJson(err), 'Не удалось определить местоположение визита');
          $state.go('sales.visits');

        });
    }

    $scope.$on('$destroy', function () {

      if (!creatingMode || Visit.lastSaved(vm.visit)) {
        return;
      }

      Visit.eject(vm.visit);
      _.each(answersByQuestion, ans => {
        VisitAnswer.eject(ans);
      });

    });

    /*
     Functions
     */

    function takePhoto() {
      return PhotoHelper.takePhoto('VisitPhoto', { visitId: vm.visit.id }, vm.thumbnails);
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
        afterMapInit() {

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

            let message = 'Требуемая точность — ' + REQUIRED_ACCURACY + 'м. ';
            message += 'Достигнутая точность — ' + location.horizontalAccuracy + 'м.';
            return ConfirmModal.showMessageAskRepeat(message, getLocation, $q.reject());

          }

        });

    }

    function quit() {
      return $scope['$$destroyed'] || goBack();
    }

    function goBack() {

      if (rootState === 'sales.visits') {
        return $state.go(rootState);
      }

      $state.go('^');

    }

    function changeAnswer(qst, data) {

      let ans = answersByQuestion[qst.id] || VisitAnswer.inject({ visitId: vm.visit.id, questionId: qst.id });

      if (qst.dataType.code === 'boolean') {
        ans.data = data && '1' || '0';
      } else if (qst.dataType.code === 'date') {
        ans.data = data && moment(data).format('YYYY/MM/DD') || null;
      } else {
        ans.data = data;
      }

      answersByQuestion[qst.id] = ans;
      VisitAnswer.save(ans);

    }

    function save() {

      vm.saving = true;

      function done() {
        vm.saving = false;
      }

      vm.busy = $q((resolve, reject) => {

        if (creatingMode) {

          getLocation()
            .then(checkOutLocation => {

              vm.visit.checkOutLocationId = checkOutLocation.id;

              Visiting.saveVisit(vm.visit)
                .then(visit => {

                  toastr.info(Visiting.visitTime(visit), 'Визит завершен');

                  SalesmanAuth.login(vm.visit.salesman);

                  resolve(visit);

                  quit();

                })
                .catch(err => {
                  reject(err);
                  toastr.error(angular.toJson(err), 'Не удалось сохранить визит');
                });

            })
            .catch(err => {
              reject(err);
              toastr.error(angular.toJson(err), 'Не удалось определить местоположение');
            });

        } else {

          Visiting.saveVisit(vm.visit)
            .then(resolve, reject)
            .then(quit);

        }

      })
        .then(done, done);

    }

    function deleteVisit() {

      if (!Visit.lastSaved(vm.visit)) {
        return quit();
      }

      ConfirmModal.show({
        text: 'Действительно удалить запись об этом визите?'
      })
        .then(() => Visit.destroy(vm.visit))
        .then(quit);

    }

    function postRefresh() {

      answersByQuestion = _.keyBy(vm.visit.answers, 'questionId');

      vm.answers = _.mapValues(answersByQuestion, ans => {

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

    }


  }

  angular.module('webPage')
    .controller('VisitCreateController', VisitCreateController);

})();
