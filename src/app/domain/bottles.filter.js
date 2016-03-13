angular.module('core.services')
  .filter('bottles', function() {
    return function bottlesFilter (volume) {

      var dict = {
        w1: 'бутылка',
        w24: 'бутылки',
        w50: 'бутылок'
      };

      var word = dict.w50;

      function getWord () {

        if (volume >= 10 && volume <= 20) {
          return word;
        }

        var lastDigit = volume % 10;

        if (lastDigit === 1) {
          return dict.w1;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
          return dict.w24;
        }

        return dict.w50;

      }

      volume = volume || 0;

      return volume.toFixed(0) + ' ' + getWord();

    };
  });
