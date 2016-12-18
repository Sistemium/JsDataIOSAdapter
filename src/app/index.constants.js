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

    .run($rootScope => {
      $rootScope.datepickerOptions = {
        showWeeks: false
      };
    })

})();
