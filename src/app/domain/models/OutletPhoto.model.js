'use strict';

(function () {

  angular.module('Models').run(function (Schema,IOS,$q) {

    Schema.register ({

      name: 'OutletPhoto',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        }
      },

      methods: {

        getImageSrc: function (size) {
          var obj = this;
          return IOS.isIos() ? IOS.getPicture(obj.id,size)
            .then(function(data){
              return 'data:image/jpeg;base64,' + data;
            }) : $q(function(resolve){
            switch (size) {
              case 'resized': return resolve(obj.href && obj.href.replace(/(.*\/)(.*)(\..{3,4})$/,'$1smallImage$3'));
              default: return resolve(obj.thumbnailHref);
            }
          });
        }

      }

    });

  });

})();
