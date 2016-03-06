'use strict';

(function () {

  angular.module('core.services')
    .service ('Errors', function () {
      var errors = [];

      // TODO: catch http errors 401, 403, 50x and arrays from STAPI validators
      function parseError(e) {

        var data = e && e.data && e.data.length > 0 && e.data ||
          [e]
        ;

        data.forEach(function (errObj) {
          errors.push({
            type: 'danger',
            msg: errObj.message || errObj
          });
        });

      }

      function addError(error) {
        parseError(error);
      }

      function clearErrors () {
        errors.splice(0,errors.length);
      }

      return {
        addError: addError,
        clear: clearErrors,
        errors: errors
      };
    })
  ;

}());
