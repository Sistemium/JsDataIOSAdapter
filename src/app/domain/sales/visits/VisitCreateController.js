'use strict';

(function () {

  const REQUIRED_ACCURACY = 500;

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth, Sockets,
                                 moment, geolib, Helpers, mapsHelper, Visiting) {

    const { ConfirmModal, toastr, PhotoHelper, LocationHelper, saControllerHelper } = Helpers;
    const { yLatLng } = mapsHelper;

    const { Visit, Location } = Schema.models();
    const { VisitAnswer, VisitPhoto } = Schema.models();

    const creatingMode = !!_.get($state, 'current.name').match(/\.visitCreate$/);

    let vm = saControllerHelper.setup(this, $scope);
    let buttons = [];

    vm.use({

      buttons,
      creatingMode,
      thumbnails: {},

      activeTab: 1,

      mapOptions: {
        avoidFractionalZoom: false,
        margin: 0,
        balloonAutoPanMargin: 300
      },

      showSalesman: SalesmanAuth.hasOptions,

      thumbnailClick,
      goBack,
      changeAnswer,
      save,
      mapClick: () => vm.visitMapPopoverOpen = false,
      deleteVisit,

      importData(name) {
        return (data) => (vm[name] = data);
      },

      visitType() {
        const isReal = !_.get(this, 'visit.props') || this.visit.props.isRealVisit;
        return isReal ? 'Визит' : 'По телефону';
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
        clickFn: 'deleteVisit'
      });

      buttons.push({
        label: !creatingMode ? 'Готово' : 'Завершить',
        clickFn: 'save',
        class: 'btn-success',
        isDisabled() {
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
              initPhoto();
              return visit;
            })
            .then(initMap);
        })
        .then(postRefresh)
        .catch(err => console.error(err));

    } else {

      checkInAndCreate();

    }

    /*
     Listeners
     */

    vm.watchScope('vm.busySavingPicture', onBusySavingPicture);

    $scope.$on('$destroy', function () {

      if (!creatingMode || Visit.lastSaved(vm.visit)) {
        return;
      }

      Visit.eject(vm.visit);
      _.each(answersByQuestion, ans => {
        VisitAnswer.eject(ans);
      });

    });

    $scope.$on('$destroy', Sockets.jsDataSubscribe(['VisitPhoto']));
    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'VisitPhoto') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      VisitPhoto.inject(data);

    }

    function checkInAndCreate() {

      vm.busy = getLocation()
        .then(createVisitWithLocation)
        .catch(err => {

          if ($scope['$$destroyed']) return;

          toastr.error(angular.toJson(err), 'Не удалось определить местоположение визита');
          $state.go('sales.visits');

        });
    }

    function createVisitWithLocation(checkInLocation) {

      const { visitSalesmanId } = $state.params;

      if (!visitSalesmanId) return;

      const newVisit = Visit.createInstance({
        date,
        outletId,
        salesmanId: visitSalesmanId,
        checkInLocationId: checkInLocation.id,
        props: { isRealVisit: true },
      });

      // If use went out to another state before the promise is resolved
      if ($scope['$$destroyed']) return;


      let outletLocation = _.get(newVisit, 'outlet.location');

      if (outletLocation) {
        const distance = geolib.getDistance(outletLocation, checkInLocation);
        toastr.success(
          `Расстояние до точки ${Math.round(distance)} м.`,
          'Успешное начало визита',
          { timeOut: 10000 }
        );
      }

      return Visiting.saveVisit(newVisit)
        .then(visit => {
          $state.go('.', { visitId: visit.id });
        });

    }

    function onBusySavingPicture(promise) {

      if (!promise || !promise.then) {
        return;
      }

      vm.cgBusy = { promise, message: 'Сохранение изображения' };

      promise.then(() => {
        initPhoto();
      });

    }

    function initPhoto() {
      vm.visitPhoto = { visitId: vm.visit.id };
    }

    function thumbnailClick(pic) {

      let resourceName = 'VisitPhoto';
      let title = vm.visit.outlet.partner.shortName + ' (' + vm.visit.outlet.address + ')';

      return PhotoHelper.thumbnailClick(resourceName, pic, null, title);

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

      const missing = Visiting.hasMissingRequirements(vm.visit, vm.configuration);

      if (missing) {
        return toastr.error(missing, 'Не выполнены задачи визита', { timeOut: 9000 });
      }

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
      vm.answers = Visiting.questionsMap(answersByQuestion);
      const visitConfiguration = Visiting.visitConfiguration(vm.visit);
      vm.configuration = visitConfiguration;

      if (!Visiting.priceGatheringArticleIds(visitConfiguration, vm.visit).length) {
        vm.activeTab = 2;
        if (!vm.creatingMode) {
          vm.activeTab = 3;
        }
        return;
      }

      vm.activeTab = 1;

      $scope.$watch(() => JSON.stringify(vm.visit.prices), () => {
        if (!vm.visit.DSHasChanges()) {
          return;
        }
        Visiting.saveVisit(vm.visit);
      });

      return Visiting.findPriceGatheringData(visitConfiguration, vm.visit)
        .then(priceGathering => {
          vm.priceGathering = priceGathering;
        });

    }


  }

  angular.module('webPage')
    .controller('VisitCreateController', VisitCreateController);

})();
