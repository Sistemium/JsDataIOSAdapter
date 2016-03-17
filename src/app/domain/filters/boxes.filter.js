angular.module('core.services')
  .filter('boxes', function(Language) {
    return function boxesFilter (volume) {

      var dict = {
        w1: 'коробка',
        w24: 'коробки',
        w50: 'коробок'
      };

      volume = parseInt(volume) || 0;

      return volume.toFixed(0) + ' ' + dict [Language.countableState(volume)];

    };
  });
