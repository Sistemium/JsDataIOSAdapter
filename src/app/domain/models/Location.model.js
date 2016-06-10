'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'Location',

      labels: {
        multiple: 'Геометки',
        single: 'Геометка'
      }

    });

  });

})();
