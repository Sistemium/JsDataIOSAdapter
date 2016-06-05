'use strict';

(function () {

  function IOS ($window, $q) {
    
    var me = {
      
      getRoles: function () {
        
        return $q(function (resolve) {
          resolve({
            roles: {}
          });
        });
        
      }
      
    };
  
    function init () {
      return me;
    }
    
    return {
      
      init: init,
      
      isIos: function () {
        return !!$window.webkit;
      },
      
      handler: function (name) {
        return $window.webkit.messageHandlers[name];
      }
      
    };
    
  }
  
  angular.module('sistemium')
    .service('IOS', IOS);
  
})();
