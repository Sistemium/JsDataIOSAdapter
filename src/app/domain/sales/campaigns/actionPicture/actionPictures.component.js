(function () {

  const URL = 'app/domain/sales/campaigns/actionPicture';
  const THUMBNAIL_HEIGHT = 200;

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
        const height = THUMBNAIL_HEIGHT * this.picture.height / 100;
        this.height = `${Math.floor(height)}px`;
      },
    });
  }

})();
