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

    models.Article.bindAll({}, $scope, 'vm.articles');
    models.ArticleGroup.bindAll({}, $scope, 'vm.articleGroups');

    models.Article.findAll(false,{
      pageSize: 5
    }).then(function(articles){
      articles.forEach(function(article){
        $log.log (article);
        models.Article.loadRelations(article);
      })
    });

    activate();

    function activate() {
      getWebDevTec();
      $timeout(function () {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    $window.onBarcodeScan = function (code, type) {
      vm.barCodes.push({
        code: code,
        type: type
      });
      $scope.$apply();
    };

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
