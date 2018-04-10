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
          Location: [{
            localField: 'checkInLocation',
            localKey: 'checkInLocationId'
          },{
            localField: 'checkOutLocation',
            localKey: 'checkOutLocationId'
          }],
          // Account: {
          //   localField: 'account',
          //   localKey: 'author'
          // },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          }
        },
        hasMany: {
          VisitPhoto: {
            localField: 'photos',
            foreignKey: 'visitId'
          },
          VisitAnswer: {
            localField: 'answers',
            foreignKey: 'visitId'
          }
        }
      },

      fieldTypes: {
        date: 'date'
      },

      computed: {

        finished

      },

      methods: {

        answerByQuestion: function (q) {
          return _.findWhere(this.answers,{ questionId:q.id });
        },

        duration: function() {
          let start = _.get(this, 'checkInLocation.timestamp');
          let finish = _.get(this, 'checkOutLocation.timestamp');
          if (start && finish) {
            let diff = moment(finish).diff(start,'seconds');
            return diff > 60 ? Math.round(diff/60) + ' мин' : diff + ' сек';
          }
        }

      }

    });

    function finished() {
      return this.checkInLocationId && !!this.checkOutLocationId;
    }

  });

})();
