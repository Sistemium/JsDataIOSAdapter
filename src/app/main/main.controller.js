(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, $scope, $window, $log, models, webDevTec, toastr) {
    var vm = this;

    vm.awesomeThings = [];
    vm.classAnimation = '';
    vm.creationDate = 1456997822714;
    vm.showToastr = showToastr;
    vm.barCodes = [];

    vm.stockBatches = [];

    models.Article.bindAll({}, $scope, 'vm.articles');
    models.ArticleGroup.bindAll({}, $scope, 'vm.articleGroups');

    var pageSize = 3000;

    vm.getArticles = function (startPage) {
      models.Article.findAll({
        offset: (startPage - 1) * pageSize,
        limit: pageSize
      }, {
        bypassCache: true
      }).then(function (articles) {

        articles.forEach(function (article) {
          models.Article.loadRelations(article);
        });

        $log.log(articles.length);

        if (articles.length === pageSize && startPage * pageSize < 10000) {
          vm.getArticles(startPage + 1);
        }

      });
    };

    //models.StockBatch.findAll({
    //  limit: pageSize
    //}).then(function () {
    //  //vm.getArticles(1);
    //
    //});

    activate();

    function activate() {
      getWebDevTec();
      $timeout(function () {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    function scanner (code, type) {

      vm.stockBatches = [];

      vm.barCodes.push({
        code: code,
        type: type
      });

      models.StockBatchBarCode.findAll({
        code: code
      }).then(function (res) {

        res.forEach(function (i) {
          models.StockBatchBarCode.loadRelations(i).then(function (sbbc){
            models.StockBatch.loadRelations(sbbc.StockBatch);
            vm.stockBatches.push (sbbc.StockBatch);
          });
        });

      });

    }

    $window.onBarcodeScan = scanner;

    $window.models = models;

    if ($window.webkit) {
      $window.webkit.messageHandlers.barCodeScannerOn.postMessage('onBarcodeScan');
    }

    function showToastr() {
      toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
      vm.classAnimation = '';
    }

    function getWebDevTec() {
      vm.awesomeThings = webDevTec.getTec();

      angular.forEach(vm.awesomeThings, function (awesomeThing) {
        awesomeThing.rank = Math.random();
      });
    }
  }
})();
