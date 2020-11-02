(function () {

  const URL = 'app/domain/sales/campaigns/actionPicture';

  angular.module('webPage')
    .component('actionPicture', {

      bindings: {
        picture: '<',
      },

      templateUrl: `${URL}/actionPicture.html`,
      controller: actionPictureController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionPictureController() {
    _.assign(this, {
      $onInit() {
        const height = Math.floor(200 * this.picture.height / 100);
        this.height = `${height}px`;
      },
    });
  }

})();
