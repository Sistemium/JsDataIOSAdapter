(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  /** @ngInject */
  function PlayGroundController($scope, $window, $log, $filter, Language, SoundSynth, Auth, models) {
    var vm = this;

    vm.barCodes = [];
    vm.stockBatches = [];

    models.Setting.bindAll({}, $scope, 'vm.display');
    models.Setting.findAll({
      group: 'domain',
      name: 'picking.date'
    });

    //models.PickingOrderPosition.bindAll({}, $scope, 'vm.articleGroups');

    //models.PickingOrder.findAll();
    //models.PickingOrderPosition.findAll();

    // var boxPcs = {
    //   box: 101,
    //   pcs: 312
    // };
    //
    // vm.display = {
    //   boxes: $filter ('boxes') (22),
    //   bottles: $filter ('bottles') (21),
    //   full: $filter ('boxPcs') ({box: 21, pcs: 0}),
    //   speakableCountFemale: Language.speakableCountFemale (3),
    //   speakableBoxPcs: Language.speakableBoxPcs (boxPcs)
    // };
    //
    // vm.currentUser = {
    //   user: Auth.getCurrentUser(),
    //   id: $window.localStorage.getItem('currentPickerId')
    // };

    //SoundSynth.say (Language.speakableBoxPcs (boxPcs));

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

    function scanner(code, type) {

      vm.stockBatches = [];

      vm.barCodes.push({
        code: code,
        type: type
      });

      models.StockBatchBarCode.findAll({
        code: code
      }).then(function (res) {

        res.forEach(function (i) {
          models.StockBatchBarCode.loadRelations(i).then(function (sbbc) {
            models.StockBatch.loadRelations(sbbc.StockBatch, 'Article');
            vm.stockBatches.push(sbbc.StockBatch);
          });
        });

      });

    }

    $window.onBarcodeScan = scanner;

    $window.models = models;

    //if ($window.webkit) {
    //  //$window.webkit.messageHandlers.barCodeScannerOn.postMessage('onBarcodeScan');
    //  $window.webkit.messageHandlers.sound.postMessage({
    //    text: 'Стужа мягкая 0 375',
    //    rate: 0.45,
    //    pitch: 1
    //  });
    //}

    //models.LogMessage.create({
    //  text: 11,
    //  type: 'error',
    //  source: 'jsdata'
    //}).then (function(lm){
    //
    //  //lm.type = 'important';
    //  //models.LogMessage.save(lm.id).then (function(lm2) {
    //  //  vm.articleGroups = lm2;
    //  //});
    //
    //  models.LogMessage.destroy (lm.id).then (function (res){
    //    vm.barCodes = {succ: res};
    //  },function (res){
    //    vm.barCodes = {err: res};
    //  });
    //
    //  vm.articleGroups = {success: lm};
    //}, function (err) {
    //  vm.articleGroups = {error: err};
    //});

  }
})();
