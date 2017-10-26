(function () {

  angular.module('core.services')
    .filter('bottles', function (Language) {

      return function bottlesFilter(volume) {

        var dict = {
          w1: 'бутылка',
          w24: 'бутылки',
          w50: 'бутылок'
        };

        volume = parseInt(volume) || 0;

        return volume.toFixed(0) + ' ' + dict [Language.countableState(volume)];

      };

    });

})();
