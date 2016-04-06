'use strict';

(function () {

  angular.module('webPage')
    .controller('SocketsController', function (models) {

      var vm = this;
      var Article = models.Article;

      Article.findAll({}, {adapter: 'socket'}).then(function (data) {
        vm.data = data;
      }).catch(function (err) {
        vm.err = err;
      });
    })
  ;

}());
