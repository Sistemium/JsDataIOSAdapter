(function () {

  angular.module('sistemium')
    .component('confirmedButton', {
      transclude: true,
      bindings: {
        text: '@',
        confirmText: '@',
        buttonClass: '@',
        onConfirm: '&',
      },
      templateUrl: 'app/domain/components/confirmedButton/confirmedButton.html',
      controllerAs: 'vm',
      controller($timeout) {
        _.assign(this, {
          buttonClick: () => {
            if (this.confirmation) {
              return this.onConfirm();
            }
            this.confirmation = $timeout(() => this.confirmation = false, 5000);
          },
          cancelClick: () => {
            if (this.confirmation) {
              $timeout.cancel(this.confirmation);
            }
            this.confirmation = false;
          },
        });
      },
    });

})();
