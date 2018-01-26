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

  function outletNavigationBar($timeout, $scope, $window) {

    const vm = _.assign(this, {
      tabs: {saleOrder: 'Заказы', debt: 'Долги', visit: 'Визиты', miscellaneous: 'Прочее'},
      $onInit,
      moveTo,
      showLeft: null,
      showRight: null
    });

    const tabCount = Object.keys(vm.tabs).length;
    const tabBar = angular.element(document.getElementsByClassName('tab-bar'))[0];

    $scope.$on('$destroy', () => {
      angular.element(tabBar).unbind('scroll');
      angular.element($window).unbind('resize');
    });

    angular.element(tabBar).bind('scroll', _.debounce(() => {
      defineChevron();
    }, 100));

    angular.element($window).bind('resize', _.debounce((a) => {
      console.log(a);
      defineChevron();
    }, 100));

    function defineChevron() {
      let tab = angular.element(document.getElementsByClassName('tab'))[0];

      let tabOffset = tab.offsetWidth * tabCount - tabBar.clientWidth;
      let scrollLeftTabBar = tabBar.scrollLeft;

      if (tabOffset === scrollLeftTabBar && tabOffset === 0) {
        vm.showLeft = false;
        vm.showRight = false;
        return;
      }

      if (scrollLeftTabBar >= 20) {
        vm.showLeft = true;
      } else {
        vm.showLeft = false;
      }

      if (tabOffset - scrollLeftTabBar >= 20) {
        vm.showRight = true;
      } else {
        vm.showRight = false;
      }

      $timeout(() => {
        $scope.$apply();
      })

    }

    function $onInit() {

      vm.currentTab = 'miscellaneous';

      $timeout(10).then(() => {
        defineChevron();
        //moveTo();
      });

    }

    //function moveTo() {
    //  let activeTab = angular.element(document.getElementsByClassName('active-tab'))[0];
    //  let tabBar = angular.element(document.getElementsByClassName('tab-bar'))[0];
    //
    //  tabBar.scrollLeft = activeTab.dataset.key * activeTab.clientWidth + (activeTab.dataset.key > 0 ? 1 : 0) + (vm.showLeft || vm.showRight ? chevronWidth : 0);
    //}

  }

})(angular.module('Sales'));
