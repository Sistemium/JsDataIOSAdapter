(function (module) {

  module.component('settingsPopover', {

    bindings: {
      items: '<'
    },

    controller: settingsPopoverController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/settingsPopover/settingsPopover.html'

  })
    .run(initSettings);

  const items = {
    catalogue: [
      // {code: 'hideFirstLevel', labelOff: 'Показать первый уровень', labelOn: 'Скрыть первый уровень'},
      {code: 'showImages', labelOff: 'Убрать фото', labelOn: 'Показать фото'},
      {code: 'hideBoxes', labelOff: 'Показать коробки', labelOn: 'Убрать коробки'},
      {code: 'showBarCodes', labelOff: 'Убрать штрих-коды', labelOn: 'Показать штрих-коды'},
      {code: 'catalogueLeft', labelOff: 'Цены справа', labelOn: 'Цены слева'},
      {code: 'hideSearchHistory', labelOff: 'Показывать подсказки поиска', labelOn: 'Скрыть подсказки поиска'},
      {code: 'hideSideNavPortrait', labelOff: 'Показывать фильтры в портрете', labelOn: 'Скрыть фильтры в портрете'},
    ],
    debts: []
  };

  function initSettings($rootScope, localStorageService) {
    _.each(items, settingsGroup => {
      _.each(settingsGroup, item => {
        let {code} = item;
        $rootScope[code] = localStorageService.get(code) || false;
      });
    });
  }

  function settingsPopoverController($scope, $rootScope, localStorageService) {

    const vm = _.assign(this, {
      $onInit,
      buttonClick
    });

    $scope.$watch('vm.isPopoverOpen', isPopoverOpen => {
      $rootScope.isShownSettings = !!isPopoverOpen;
      $rootScope.$broadcast('settingsPopoverOpen', isPopoverOpen);
    });

    /*
    Functions
     */

    function $onInit() {

      vm.buttons = _.map(items[vm.items], item => {

        let {code} = item;

        vm[code] = $rootScope[code];

        let stmClick = `toggle${_.upperFirst(item.code)}`;

        return _.assign({stmClick}, item);

      });

    }

    function buttonClick(button) {

      let {code} = button;

      localStorageService.set(code, vm[code] = !vm[code]);
      $rootScope[code] = vm[code];

    }

  }

})(angular.module('webPage'));
