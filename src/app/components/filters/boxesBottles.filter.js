(function () {

  angular.module('sistemium')
    .filter('boxesBottles', () =>
      function (num, { boxRel = 1 } = {}) {

        let box = boxRel > 1 ? Math.floor(1.0 * num / boxRel) : 0;
        let pcs = boxRel > 1 ? num % boxRel : num;

        return (box ? `${box} К` : '') + (pcs ? `${box?' ':''}${pcs} б` : '');

      });

})();
