'use strict';

(function () {

  angular.module('webPage').component('choiceList', {

    bindings: {
      title: '@',
      choiceId: '=',
      options: '<',
      onClick: '=',
      firstName: '@',
      smallName: '@',
      orderBy: '@'
    },

    controller: choiceListController,

    templateUrl: 'app/domain/components/choiceList/choiceList.html',
    controllerAs: 'vm'

  });

  function choiceListController() {

    const vm = _.assign(this, {
      optionClick,
      $onInit
    });

    function optionClick(option) {
      vm.choiceId = option.id;
      if (_.isFunction(vm.onClick)) {
        vm.onClick(option);
      }
    }

    function $onInit() {
      console.log(vm);
      vm.firstName = vm.firstName || 'name';
      vm.smallName = vm.smallName || 'address';
      vm.orderBy = vm.orderBy || vm.firstName;
    }

  }

})();
