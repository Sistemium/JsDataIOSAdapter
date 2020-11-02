(function () {

  const URL = 'app/domain/sales/campaigns/actionPictures';

  angular.module('webPage')
    .component('actionPictures', {

      bindings: {
        action: '<',
      },

      templateUrl: `${URL}/actionPictures.html`,
      controller: actionPicturesController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function actionPicturesController() {

    _.assign(this, {

      $onInit() {

        const { layout = {} } = this.action;
        const justify = layout.align;
        const pictures = _.filter(layout.pictures, 'thumbnailSrc');

        _.assign(this, {
          style: { 'justify-content': justify },
          layout,
          pictures,
          hasLabels: _.filter(pictures, 'label').length,
        });

      },

    });

  }

})();
