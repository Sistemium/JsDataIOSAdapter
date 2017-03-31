'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PrePreOrder',

      labels: {
        multiple: 'Предзаказы ЭТП'
      },

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        },
        hasMany: {
          PrePreOrderPosition: {
            localField: 'positions',
            foreignKey: 'prePreOrderId'
          }
        }
      },

      computed: {
        processingClass: ['processing', function (processing){
          return 'glyphicon glyphicon-' + (function () {
              if (processing === 'done') {
                return 'ok green';
              } else if (processing === 'upload') {
                return 'import blue';
              } else if (processing === 'draft') {
                return 'question-sign gray';
              }
            })();
        }],
        processingLabel: ['processing', function (processing) {
          switch (processing) {
            case 'done': return 'Обработан';
            case 'upload': return 'Обрабатывается';
            case 'draft': return 'Черновик';
          }
        }]
      },

      aggregables: ['totalCost']

    });

  });

})();
