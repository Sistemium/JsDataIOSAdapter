(function () {

  angular.module('core.services')
    .filter('days', function () {

      const labels = {
        w1: 'день',
        w2: 'дня',
        w5: 'дней'
      };

      return function (num) {

        let key;

        let val = Math.abs(num);

        let last2 = val % 100;
        let last1 = val % 10;

        if (last2 >= 5 && last2 <= 20 || last1 >= 5 && last1 <= 9 || last1 === 0) {
          key = 'w5';
        } else if (last1 === 1) {
          key = 'w1';
        } else {
          key = 'w2';
        }

        return `${val} ${labels[key]}`;

      };

    });

})();
