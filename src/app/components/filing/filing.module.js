/* global window:false */

(function () {

  angular.module('Filing', [])
    .constant('XLSX', window.XLSX || null);

})();
