'use strict';

/* global moment:false */

(function () {

  angular
    .module('webPage')

    .constant('moment', moment)

    .value('cgBusyDefaults', {
      message: 'Идет загрузка',
      delay: 100,
      minDuration: 300,
      templateUrl: 'app/components/busy/busy.html'
    })

    .config(uibDatepickerPopupConfig => {
      uibDatepickerPopupConfig.datepickerPopupTemplateUrl = 'app/domain/components/datePicker/datePickerPopup.html';
    })

    .config($uibTooltipProvider => {
      $uibTooltipProvider.options({
        placement: 'auto bottom-left'
      });
    })

    .run(moment => {
      moment.defaultFormat = 'YYYY-MM-DD';
    })

    .run($rootScope => {
      $rootScope.datepickerOptions = {
        showWeeks: false
      };
    })

})();
