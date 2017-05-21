'use strict';

(function (module) {

  module.component('makePhotoReport', {

    bindings: {
      // isPopoverOpen: '='
    },

    templateUrl: 'app/domain/components/makePhotoReport/makePhotoReport.html',

    controller: makePhotoReportController,
    controllerAs: 'vm'

  });


  function makePhotoReportController() {

    const vm = _.assign(this, {
      onSubmit,
      triggerClick
    });

    function onSubmit() {
      vm.isPopoverOpen = false;
    }

    function triggerClick() {
      vm.isPopoverOpen = !vm.isPopoverOpen;
    }

  }

})(angular.module('Sales'));
