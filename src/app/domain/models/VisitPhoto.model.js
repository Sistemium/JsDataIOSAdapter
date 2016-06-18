'use strict';

(function () {

    angular.module('Models').run(function (Schema,IOS) {

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
            return IOS.getPicture(this.id,size)
              .then(function(data){
                return 'data:image/jpeg;base64,' + data;
              });
          }

        }

      });

    });

})();
