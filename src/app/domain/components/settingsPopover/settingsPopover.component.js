(function (module) {

  module.component('settingsPopover', {

    bindings: {
      items: '<'
    },

    controller: settingsPopoverController,
    controllerAs: 'vm',

    templateUrl: 'app/domain/components/settingsPopover/settingsPopover.html'

  });

  function settingsPopoverController($scope, $rootScope, localStorageService) {

    const items = {
      catalogue: [
        {code: 'showFirstLevel', labelOff: 'Скрыть первый уровень', labelOn: 'Показать первый уровень'},
        {code: 'showImages', labelOff: 'Убрать фото', labelOn: 'Показать фото'},
        {code: 'hideBoxes', labelOff: 'Показать коробки', labelOn: 'Убрать коробки'},
        {code: 'showBarCodes', labelOff: 'Убрать штрих-коды', labelOn: 'Показать штрих-коды'},
        {code: 'catalogueLeft', labelOff: 'Цены справа', labelOn: 'Цены слева'}
      ],
      debts: []
    };

    const vm = _.assign(this, {
      $onInit,
      buttonClick
    });

    $scope.$watch('vm.isPopoverOpen', isPopoverOpen => {
      $rootScope.$broadcast('settingsPopoverOpen', isPopoverOpen);
    });

    /*
    Functions
     */

    function $onInit() {

      vm.buttons = _.map(items[vm.items], item => {

        let {code} = item;

        $rootScope[item] = vm[code] = localStorageService.get(code) || false;

        let stmClick = `toggle${_.upperFirst(code)}`;

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
