'use strict';

(function () {

  angular.module('webPage')
    .service('models',function(DS, IosAdapter, $log){

      DS.registerAdapter('ios', new IosAdapter(), {default: true});

      var Article = DS.defineResource('Article');

      $log.log (Article);

      return {
        Article: Article
      };

    }).run (function (models,$log){
      models.Article.findAll().then(function () {
        $log.log('findAll resolved');
      });
    });

}());
