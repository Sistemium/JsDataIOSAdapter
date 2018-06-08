(function () {

  const wDict = {
    w1: 'позиция',
    w24: 'позиции',
    w50: 'позиций'
  };

  angular.module('webPage')
    .filter('positionsCount', (Language) =>
      function (count) {

        return `${count} ${wDict[Language.countableState(count)]}`;

      });

})();
