/* global moment:false */
(function() {
  'use strict';

  angular
    .module('webPage')
    .constant('moment', moment)
    .value('cgBusyDefaults',{
      message:'Идет загрузка'
    });

})();
