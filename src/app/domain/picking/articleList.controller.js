'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', function ($scope, models) {

      var vm = this;
      vm.articles = [];

      if ($scope.vm.selectedItems) {
        $scope.vm.selectedItems.forEach(function (i) {
          console.log(i);
          i.positions.forEach(function (p) {
            models.PickingOrderPosition.loadRelations(p).then(function (a) {
              console.log(a);
              vm.articles.push(a.Article);
            })
          });
        });
      }

    })
  ;

}());
