(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'StockTaking',

      adapter: 'localStorage',

    });

  });


})();
