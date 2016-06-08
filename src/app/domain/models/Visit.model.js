'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'Visit',

      labels: {
        multiple: 'Визиты в точки',
        single: 'Визит в точки'
      },

      relations: {
        hasOne: {
          Account: {
            localField: 'account',
            localKey: 'author'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Location: {
            localField: 'checkInLocation',
            localKey: 'checkInLocationId'
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          }
        },
        hasMany: {
          VisitAnswer: {
            localField: 'answers',
            foreignKey: 'visitId'
          },
          VisitPicture: {
            localField: 'pictures',
            foreignKey: 'visitId'
          }
        }
      },

      computed: {
      },

      methods: {
        answerByQuestion: function (q) {
          return _.findWhere(this.answers,{ questionId:q.id });
        }
      }

    });

  });

})();
