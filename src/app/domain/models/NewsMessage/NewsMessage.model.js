'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'NewsMessage',
      watchChanges: false

    });

  });

})();