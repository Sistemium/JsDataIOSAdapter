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
          Account: {
            localField: 'account',
            localKey: 'author'
          },
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
      },

      methods: {
        answerByQuestion: function (q) {
          return _.findWhere(this.answers,{ questionId:q.id });
        },
        duration: function() {
          var start = _.get(this, 'checkInLocation.deviceCts');
          var finish = _.get(this, 'checkOutLocation.deviceCts');
          if (start && finish) {
            var diff = moment(finish).diff(start,'seconds');
            return diff > 60 ? Math.round(diff/60) + ' мин' : diff + ' сек';
          }
        }
      }

    });

  });

})();
