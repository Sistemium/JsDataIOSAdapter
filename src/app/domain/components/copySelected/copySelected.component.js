(function () {

  angular.module('Sales').component('copySelected', {

    bindings: {
      selectedItems: '=',
      inProgress: '=',
      textFromItem: '<'
    },

    templateUrl: 'app/domain/components/copySelected/copySelected.html',

    controller: copySelectedController,
    controllerAs: 'vm'

  });

  function copySelectedController(IOS, toastr) {

    const vm = _.assign(this, {
      isIos: IOS.isIos(),
      triggerClick,
      isReady,
      cancelClick
    });

    /*
    Functions
     */

    function triggerClick() {

      if (vm.inProgress) {

        let textToCopy = '';

        Object.values(vm.selectedItems).forEach(debt => {

          textToCopy += vm.textFromItem(debt);

        });

        IOS.copyToClipboard(textToCopy)
          .then(() => {
            toastr.success('Выбранные долги скопированы в буфер обмена');
          });

        vm.inProgress = false;

        return;

      }

      vm.inProgress = true;

    }

    function isReady() {

      return vm.inProgress && Object.values(vm.selectedItems).length;

    }

    function cancelClick() {

      vm.inProgress = false;

    }

  }


})();
