(function () {

  angular.module('Sales').component('copySelected', {

    bindings: {
      selectedItems: '=',
      inProgress: '=',
      textFromItem: '<',
      total: '<'
    },

    templateUrl: 'app/domain/components/copySelected/copySelected.html',

    controller: copySelectedController,
    controllerAs: 'vm'

  });

  function copySelectedController(IOS, toastr, $window) {

    const vm = _.assign(this, {
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

      if (!IOS.isIos()) {
        copyToClipboard(textToCopy);
        success();
      } else {
        IOS.copyToClipboard(textToCopy)
          .then(success);
      }

      function success() {
        toastr.success('Выбранные долги скопированы в буфер обмена');
      }

    }

    function copyToClipboard (str) {

      const el = $window.document.createElement('textarea');
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

    }

    function isReady() {

      return vm.inProgress && !_.isEmpty(vm.selectedItems);

    }

    function cancelClick() {

      vm.inProgress = false;

    }

  }


})();
