'use strict';

(function (module) {

  module.component('outletNavigationBar', {

    bindings: {
      currentTab: '='
    },

    templateUrl: 'app/domain/components/outletNavigationBar/outletNavigationBar.html',

    controller: outletNavigationBar,
    controllerAs: 'vm'

  });

  function outletNavigationBar($timeout, $scope, $window, saEtc, DomainOption) {

    const vm = _.assign(this, {

      tabs: {
        miscellaneous: 'О точке',
        saleOrder: 'Заказы',
        shipments: 'Отгрузки',
        debt: 'Долги',
        visit: 'Визиты',
        targets: 'Задачи',
      },

      $onInit,
      moveTo,

      showLeft: null,
      showRight: null

    });

    if (DomainOption.visitsDisabled()) {
      delete vm.tabs.visit;
    }

    if (!DomainOption.salesTargets()) {
      delete vm.tabs.targets;
    }

    const tabCount = Object.keys(vm.tabs).length;
    const tabBar = angular.element(saEtc.getElementById('outlet-navigation-tabbar'))[0];

    const debouncedDefineChevron = _.debounce(defineChevron, 100);

    angular.element(tabBar).on('scroll', debouncedDefineChevron);

    angular.element($window).on('resize', debouncedDefineChevron);

    $scope.$on('$destroy', () => {
      angular.element($window).off('resize', debouncedDefineChevron)
    });

    function defineChevron() {
      let tab = angular.element(document.getElementsByClassName('tab'))[0];

      let tabOffset = tab.offsetWidth * tabCount - tabBar.clientWidth;
      let scrollLeftTabBar = tabBar.scrollLeft;

      if (tabOffset === scrollLeftTabBar && tabOffset === 0) {
        vm.showLeft = false;
        vm.showRight = false;
        return;
      }

      vm.showLeft = scrollLeftTabBar >= 20;

      vm.showRight = tabOffset - scrollLeftTabBar >= 20;

      $timeout(() => {
        $scope.$apply();
      })

    }

    function $onInit() {

      vm.currentTab = vm.tabs.targets ? 'targets' : 'miscellaneous';

      $timeout(10).then(() => {
        defineChevron();
        //moveTo();
      });

    }

  }

})(angular.module('Sales'));
