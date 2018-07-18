(function () {

  angular.module('sistemium')
    .filter('splitChunk', () => {

      return function (mark, chunk = 25) {

        return _.map(_.chunk(mark, chunk), x => _.join(x, '')).join(' ');

      };

    });

})();
