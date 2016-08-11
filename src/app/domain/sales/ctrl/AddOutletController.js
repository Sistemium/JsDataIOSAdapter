'use strict';

(function () {

  function AddOutletController($state, $q, $scope, ConfirmModal, Schema, toastr, $window, LocationHelper) {

    var vm = this;
    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var Location = Schema.model('Location');

    //var deb = $window.debug('stg:addOutlet');

    const buttonsTypes = {
      blank: 'default',
      primary: 'primary',
      success: 'success',
      info: 'info',
      warning: 'warning',
      danger: 'danger'
    };

    vm.submitButton = {
      id: 'mainFormSubmit',
      title: 'Сохранить',
      type: buttonsTypes.primary,
      isOpen: false,
      description: 'Сохранить точку?'
    };

    vm.cancelButton = {
      id: 'mainFormCancel',
      title: 'Отменить',
      type: buttonsTypes.warning,
      isOpen: false,
      description: 'Отменить добавление точки?',
      subButtons: [{
        id: 'mainFormCancelConfirm',
        title: 'Да, отменить',
        type: buttonsTypes.primary
      }]
    };

    var initialButtons = [vm.submitButton, vm.cancelButton];

    function accButtonClick(form, button) {
      switch (button.id) {
        case 'mainFormCancel':
        {
          if (form.$pristine) return quit();
          break;
        }
        case 'mainFormSubmit':
        {

        }
      }
    }

    function subButtonClick(button) {
      switch (button.id) {
        case 'mainFormCancelConfirm':
        {
          cleanUp();
          quit();
          break;
        }
        case 'mainFormSubmitConfirm':
        {
          saveNewData();
        }
      }
    }

    function getPartners(viewValue, opt) {

      if (!viewValue) return;

      return Partner.findAll({
        where: {
          name: {
            likei: viewValue
          }
        }
      }, opt)
        .then(function (partners) {
          return _.sortBy(partners, function (p) {
            return p.shortName.toLowerCase();
          });
        });

    }

    function submit() {

      _.result($window.document, 'activeElement.blur');

      angular.extend(vm.submitButton, checkName());

      //ConfirmModal.show({
      //  text: 'Сохранить точку?'
      //})
      //  .then(checkOutletName)
      //  .then(checkOutletAddress)
      //  .then(saveNewData)
      //  .catch();

    }

    function checkName() {

      if (vm.selectPartner) {
        return {
          description: 'Сохранить точку?',
          subButtons: [{
            id: 'mainFormSubmitConfirm',
            title: 'Да, сохранить',
            type: buttonsTypes.primary
          }]
        }
      }

    }

    function saveNewData() {

      vm.busyMessage = 'Сохраняем партнёра…';

      vm.busy = savePartner(vm.name)
        .then(function (partner) {

          vm.busyMessage = 'Сохраняем точку…';
          return saveOutlet(vm.name, partner, vm.address);

        })
        .then(function (outlet) {

          vm.busyMessage = 'Получаем геопозицию…';
          return getLocation(outlet);

        })
        .then(function (data) {

          var location = Location.inject(data);
          vm.newOutlet.locationId = location.id;

          quit();

        })
        .catch(function (err) {

          showSaveErrorAlert(err);
          return $q.reject(err);

        });

    }

    function checkOutletName() {

      if (vm.selectedPartner) return vm.selectedPartner;

      var modalText = '';

// check full name
      var filteredPartner = _.find(vm.partners, function (partner) {
        return _.lowerCase(partner.name) === _.lowerCase(vm.name);
      });

      if (filteredPartner) {

        modalText = 'Партнёр "' + filteredPartner.name + '" уже существует. Использовать существующего партнёра или создать нового?';
        return partnerModal(filteredPartner, modalText);

      } else {

// check short name
        filteredPartner = _.find(vm.partners, function (partner) {
          return _.lowerCase(partner.shortName) === _.lowerCase(vm.name);
        });
        if (filteredPartner) {

          modalText = 'Партнёр с похожим названием: "' + filteredPartner.name + '" уже существует. Использовать этого партнёра или создать нового?';
          return partnerModal(filteredPartner, modalText);

        }

      }

    }

    function partnerModal(partner, text) {

      return ConfirmModal.show({

        buttons: [
          {
            title: 'Использовать существующего',
            id: 'useExisting',
            type: 'submit'
          },
          {
            title: 'Создать нового',
            id: 'createNew',
            type: 'submit'
          },
          {
            title: 'Отмена',
            type: 'cancel'
          }
        ],
        text: text
      })
        .then(function (buttonId) {

          switch (buttonId) {
            case 'useExisting':
            {
              vm.selectedPartner = partner;
              return partner;
            }
          }

        });

    }

    function checkOutletAddress(partner) {

      if (!partner) return $q.resolve();

      var filterParams = {
        where: {
          partnerId: {'===': partner.id},
          address: {'likei': vm.address}
        }
      };

      var filteredOutlet = Outlet.filter(filterParams)[0];

      if (filteredOutlet) {

        var modalText = 'Точка "' + filteredOutlet.name + '" с адресом ' + filteredOutlet.address + ' уже существует. Использовать существующую точку?';

        return ConfirmModal.show({
          text: modalText,
          hideCloseButton: true
        }, {
          backdrop: 'static',
          keyboard: false
        })
          .then(function () {

            $state.go('^.outlet', {id: filteredOutlet.id});
            return $q.reject();

          }, $q.reject);

      }

    }

    function savePartner(name) {

      var havePartner = vm.selectedPartner || vm.newPartner;

      if (havePartner) {
        return $q.resolve(havePartner);
      } else {

        var newPartner = Partner.createInstance({
          name: name
        });

        return Partner.create(newPartner)
          .then(function (newPartner) {

            vm.newPartner = newPartner;
            return newPartner;

          })
          .catch(function (err) {
            gotError(err, 'Не удалось сохранить партнёра.');
          });

      }

    }

    function saveOutlet(name, partner, address) {

      if (vm.newOutlet) {
        return $q.resolve(vm.newOutlet);
      } else {

        var newOutlet = Outlet.createInstance({
          address: address,
          name: name,
          partnerId: partner.id
        });

        return Outlet.create(newOutlet)
          .then(function (newOutlet) {

            vm.newOutlet = newOutlet;
            return newOutlet;

          })
          .catch(function (err) {
            gotError(err, 'Не удалось сохранить точку.');
          });

      }

    }

    function getLocation(outlet) {

      return LocationHelper.getLocation(100, outlet.id, 'Outlet')
        .catch(function (err) {
          gotError(err, 'Невозможно получить геопозицию.');
        });

    }

    function gotError(err, errText) {

      toastr.error(angular.toJson(err), errText);
      throw errText;

    }

    function showSaveErrorAlert(err) {

      var errText = err + '\n Повторить попытку?';

      ConfirmModal.show({
        text: errText
      })
        .then(saveNewData);

    }

    function inputNameFocus() {

      inputFocus();

      if (vm.selectedPartner) {
        vm.name = vm.selectedPartner.shortName;
      }
      vm.inputNameInFocus = true;

    }

    function inputNameBlur() {

      inputBlur();

      vm.inputNameInFocus = false;
      if (vm.selectedPartner) {
        vm.name = vm.selectedPartner.name;
      }

    }

    function inputFocus() {

      vm.submitButton.isOpen = false;
      vm.cancelButton.isOpen = false;

    }

    function inputBlur() {

    }

    function selectPartner(partner) {

      vm.name = partner.shortName;
      vm.selectedPartner = partner;

    }

    $scope.$watch('vm.submitButton', function (newValue, oldValue) {

      if (newValue && newValue.isOpen && newValue.isOpen !== oldValue.isOpen) {
        submit();
      }

    }, true);

    $scope.$watch('vm.cancelButton', function (newValue, oldValue) {

      if (newValue && newValue.isOpen && newValue.isOpen !== oldValue.isOpen) {
        _.result($window.document, 'activeElement.blur');
      }

    }, true);

    $scope.$watch('vm.name', function () {

      if (vm.selectedPartner && vm.inputNameInFocus) {
        if (vm.name !== vm.selectedPartner.shortName) {
          vm.selectedPartner = null;
        }
      }

      //filterPartnersByString(newValue);

    });

    function filterPartnersByString(newValue) {

      if (newValue) {

        var checkValues = _.words(_.lowerCase(newValue));

        if (!checkValues) return;

        var cPartners = {};

        vm.filteredPartners = _.filter(vm.partners, function (p) {

          var checkOk = true;
          var vIndexes = [];

          angular.forEach(checkValues, function (v) {

            if (checkOk) {

              var vIndex = _.lowerCase(p.shortName).indexOf(v);
              vIndex >= 0 ? vIndexes.push(vIndex) : checkOk = false;

            }

          });

          if (checkOk) {
            cPartners[p.id] = vIndexes;
          }

          return checkOk;

        });

        console.log(vm.filteredPartners);
        console.log(cPartners);

        vm.showPartnersDropdownList = vm.filteredPartners.length && !(vm.filteredPartners.length == 1 && vm.filteredPartners[0].shortName == vm.name);

      } else {

        vm.filteredPartners = null;
        vm.showPartnersDropdownList = false;

      }

    }

    function cleanUp() {

      if (vm.newOutlet) {

        Outlet.destroy(vm.newOutlet);
        vm.newOutlet = null;

      }

      if (vm.newPartner) {

        Partner.destroy(vm.newPartner);
        vm.newPartner = null;

      }

    }

    function quit() {
      return vm.newOutlet ? $state.go('^.outlet', {id: vm.newOutlet.id}) : $state.go('^');
    }

    angular.extend(vm, {
      buttons: initialButtons,
      accButtonClick: accButtonClick,
      subButtonClick: subButtonClick,
      selectedPartner: null,
      selectPartner: selectPartner,
      inputNameFocus: inputNameFocus,
      inputNameBlur: inputNameBlur,
      inputFocus: inputFocus,
      inputBlur: inputBlur,
      newOutlet: null,
      filterPartnersByString: filterPartnersByString,
      filteredPartners: [],
      getPartners: getPartners
    });

  }

  angular.module('webPage')
    .controller('AddOutletController', AddOutletController);

})();
