'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Workflow',

      fieldTypes: {
        workflow: Schema.config.parseJson
      }

    });

  });

})();
