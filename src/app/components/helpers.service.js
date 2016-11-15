'use strict';

(function () {

  angular.module('webPage')
    .service('Helpers', function(
      saControllerHelper,
      saEtc,
      ConfirmModal,
      mapsHelper,
      toastr,
      PhotoHelper,
      LocationHelper
    ) {

      return {

        saControllerHelper,
        saEtc,
        ConfirmModal,
        mapsHelper,
        toastr,
        PhotoHelper,
        LocationHelper

      };

    });

})();
