'use strict';

(function () {

  function pickerAuthLogger($rootScope, Schema) {
    $rootScope.$on('picker-login', (event, picker) => {

      Schema.model('LogMessage').create({
        type: 'important',
        source: 'jsdata:picker-login',
        text: picker.id
      });

    });
  }

  angular
    .module('webPage')
    .run(pickerAuthLogger);

})();
