'use strict';

(function () {

    angular.module('Models').run(function (Schema,IOS,$q) {

      Schema.register ({

        name: 'VisitPhoto',

        relations: {
          hasOne: {
            Visit: {
              localField: 'visit',
              localKey: 'visitId'
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
                  case 'resized': return resolve(obj.href);
                  default: return resolve(obj.thumbnailHref);
                }
              });
          }

        }

      });

    });

})();
