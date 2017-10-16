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

      vm.inProgress = !vm.inProgress;

      if (vm.inProgress) {
        return;
      }

      let textToCopy = _.map(vm.selectedItems, vm.textFromItem).join('\n');

      IOS.copyToClipboard(textToCopy)
        .then(() => {
          toastr.success('Выбранные долги скопированы в буфер обмена');
        });

    }

    function isReady() {

      return vm.inProgress && !_.isEmpty(vm.selectedItems);

    }

    function cancelClick() {

      vm.inProgress = false;

    }

  }


})();
