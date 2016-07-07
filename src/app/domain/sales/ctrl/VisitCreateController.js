'use strict';

(function () {

  function VisitCreateController(Schema, $scope, $state, $q, SalesmanAuth, IOS, mapsHelper, ConfirmModal, toastr) {

    var Visit = Schema.model('Visit');
    var VQS = Schema.model('VisitQuestionSet');
    var VQ = Schema.model('VisitQuestion');
    var VA = Schema.model('VisitAnswer');
    var Location = Schema.model('Location');
    var VisitPhoto = Schema.model('VisitPhoto');

    var date = moment().format('YYYY-MM-DD');
    var id = $state.params.visitId;
    var outletId = $state.params.id;
    var answersByQuestion = {};

    var salesman = SalesmanAuth.getCurrentUser();

    var vm = this;
    var creatingMode = !!_.get($state,'current.name').match(/\.visitCreate$/);

    var yaLatLng = mapsHelper.yLatLng;

    function importThumbnail(vp) {

      if (vm.thumbnails[vp.id]) {
        return vp;
      }

      return vp.getImageSrc('thumbnail').then(function (src) {
        vm.thumbnails[vp.id] = src;
        return vp;
      });

    }

    function thumbnailClick(pic) {

      ConfirmModal.show({

        text: false,
        src: vm.thumbnails[pic.id],
        title: vm.visit.outlet.partner.shortName + ' (' + vm.visit.outlet.address + ')',

        deleteDelegate: function () {
          return VisitPhoto.destroy(pic);
        },

        resolve: function (ctrl) {
          ctrl.busy = pic.getImageSrc('resized').then(function (src) {
            ctrl.src = src;
          }, function (err) {
            console.log(err);
            ctrl.cancel();
            toastr.error('Недоступен интернет', 'Ошибка загрузки изображения');
          });
        }

      }, {
        templateUrl: 'app/components/modal/PictureModal.html',
        size: 'lg'
      });

    }


    function takePhoto() {
      var q = IOS.takePhoto('VisitPhoto', {
        visitId: vm.visit.id
      });

      q.then(function (res) {

        importThumbnail(VisitPhoto.inject(res));

      }).catch(function (res) {
        vm.photo = false;
        vm.error = res;
      })
    }


    function initMap(visit) {

      var checkIn = _.get(visit, 'checkInLocation') || _.get(vm, 'visit.checkInLocation');

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


    function getLocation() {
      vm.locating = true;
      return IOS.checkIn(100, {
        ownerXid: _.get(vm, 'visit.id'),
        target: 'Visit'
      }).then(function (res) {
        vm.locating = false;
        return Location.inject(res);
      });
    }


    function quit () {
      return $scope['$$destroyed'] || $state.go('^');
    }

    var buttons = [];

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


    angular.extend(vm, {

      buttons: buttons,

      creatingMode: creatingMode,

      mapOptions: {
        avoidFractionalZoom: false,
        margin: 0,
        balloonAutoPanMargin: 300
      },

      takePhoto: takePhoto,
      thumbnailClick: thumbnailClick,

      thumbnails: {},

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
        VA.save(ans);
      },

      save: function () {

        vm.saving = true;

        var done = function(){
          vm.saving = false;
        };

        vm.busy = $q(function (resolve, reject) {

          if (creatingMode && IOS.isIos()) {

            getLocation().then(function (checkOutLocation) {
              vm.visit.checkOutLocationId = checkOutLocation.id;
              Visit.save(vm.visit)
                .then(function (visit) {
                  var cts = _.get(visit,'checkInLocation.deviceCts') || visit.deviceCts;
                  var diff = moment(visit.checkOutLocation.deviceCts).diff(cts,'seconds');
                  toastr.info(diff > 60 ? Math.round(diff/60) + ' мин' : diff + ' сек', 'Визит завершен');
                  resolve (visit);
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

        }).then(done,done);
      },

      mapClick: function () {
        vm.popover = false;
      },

      deleteVisit: function () {
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
          .then(function (v) {
            Visit.loadRelations(v, ['Location', 'VisitPhoto'])
              .then(function (visit) {
                _.each(visit.photos, importThumbnail);
                return visit;
              })
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
                return _.get(ans, 'question.dataType.code') === 'date' && ans.data ?
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
          vm.busy = getLocation();

          vm.busy.then(function (res) {

            if ($scope['$$destroyed']) {
              return;
            }

            vm.visit.checkInLocationId = res.id;
            initMap(res);
            Visit.save(vm.visit).then(function(visit){
              $state.go('.',{visitId: visit.id});
            });

          }, function (err) {

            if ($scope['$$destroyed']) {
              return;
            }

            console.error(err);
            toastr.error(angular.toJson(err), 'Не удалось определить местоположение визита');
            $state.go('^');

          });
        }

      }

    });

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

  }

  angular.module('webPage')
    .controller('VisitCreateController', VisitCreateController);

})();
