'use strict';

(function () {

  angular.module('webPage').directive('ngGallery', ngGallery);

  // inject ToastHelper if needed
  function ngGallery($document, $timeout, $q, $templateRequest, $compile) {

    var defaults = {
      baseClass: 'ng-gallery',
      thumbClass: 'ng-thumb',
      templateUrl: 'app/components/gallery/galleryTemplate.html'
    };

    var keys_codes = {
      enter: 13,
      esc: 27,
      left: 37,
      right: 39
    };


    function setScopeValues(scope) {
      scope.baseClass = scope.class || defaults.baseClass;
      scope.thumbClass = scope.thumbClass || defaults.thumbClass;
      scope.thumbsNum = scope.thumbsNum || 1; // should be odd
    }

    return {
      restrict: 'EA',

      scope: {
        imagesAll: '=',
        thumbImage: '=',
        thumbsNum: '@',
        hideOverflow: '=',
        imageHoveredFn: '&',
        thumbnailClickFn: '&',
        isDeletable: '='
      },

      controller: [
        '$scope',
        function ($scope) {


          var vm = this;

          $scope.$on('openGallery', function (e, args) {
            $scope.openGallery(args.index);
          });

          vm.thumbnailClick = function (img, index) {

            var fn = $scope.thumbnailClickFn() || $scope.openGallery;

            if (_.isFunction(fn)) {
              fn(index, img);
            }

          }
        }
      ],

      controllerAs: 'vm',

      templateUrl: function (element, attrs) {
        return attrs.templateUrl || defaults.templateUrl;
      },

      link: function (scope, element, attrs) {

        setScopeValues(scope, attrs);

        if (scope.thumbsNum >= 11) {
          scope.thumbsNum = 11;
        }

        function hideElement() {
          $timeout(function () {
            scope.showNavElems = false;
          }, 2000);
        }

        hideElement();

        var $body = $document.find('body');

        scope.showNavElems = true;
        scope.index = 0;
        scope.opened = false;
        scope.firstOpen = true;

        var loadImage = function (i) {

          var deferred = $q.defer();
          var image = new Image();

          image.onload = function () {
            scope.loading = false;
            if (this.complete === false || this.naturalWidth === 0) {
              deferred.reject();
            }
            deferred.resolve(image);
          };

          image.onerror = function () {
            deferred.reject();
          };

          scope.loading = true;

          $timeout(function () {
            image.src = scope.imagesAll[i].smallSrc;
          });


          return deferred.promise;
        };

        var showImage = function (i) {
          loadImage(scope.index).then(function (resp) {
            //defineClass(_.get(resp, 'naturalWidth'), _.get(resp, 'naturalHeight'));
            scope.img = resp.src;
            scope.id = scope.description;

            // Uncommnet if needed
            // smartScroll(scope.index);
          });
          scope.description = scope.imagesAll[i].id || '';
          scope.confirmDelete = false;
        };

        var fullscreenElement;

        //var defineClass = function (width, height) {
        //  scope.useWide = false, scope.useTall = false;
        //  width >= height ? scope.useWide = true : scope.useTall = true;
        //};

        scope.changeImage = function (i) {
          scope.index = i;
          showImage(i);
        };

        scope.nextImage = function () {

          scope.index += 1;

          if (scope.index === scope.imagesAll.length) {
            scope.index = 0;
          }

          showImage(scope.index);
        };

        scope.hideElements = function () {
          scope.showNavElems = true;
          hideElement();
        };

        scope.prevImage = function () {

          scope.hideNavElems = false;
          scope.index -= 1;
          if (scope.index < 0) {
            scope.index = scope.imagesAll.length - 1;
          }
          showImage(scope.index);
        };

        scope.setHovered = function (image) {
          if (_.isFunction(scope.imageHoveredFn())) {
            scope.imageHoveredFn()(image);
          }
        };

        scope.openGallery = function (i) {

          $templateRequest('app/components/gallery/galleryFullscreen.html')
            .then(function (html) {
              var template = angular.element(html);
              $body.append(template);
              fullscreenElement = $compile(template)(scope);
            });

          if (angular.isDefined(i)) {
            scope.index = i;
            showImage(scope.index);
          }

          scope.opened = true;

          $timeout(function () {

            smartScroll(scope.index);

          });
        };

        scope.closeGallery = function () {
          scope.opened = false;
          fullscreenElement.remove();
        };

        scope.deletePhoto = function () {

          var imageModel = scope.imagesAll[scope.index];

          if (imageModel) {
            imageModel.DSDestroy()
              .then(() => {
                scope.closeGallery();
              })
              .catch(err => {
                scope.closeGallery();
                //ToastHelper.error('Не удалось удалить изображение');
                console.error(err);
              });
          } else {
            console.error('ngGallery: Failed to initialize image model');
          }

        };

        scope.deleteClick = function () {
          if (scope.confirmDelete) {
            scope.deletePhoto();
          }
          scope.confirmDelete = !scope.confirmDelete;
        };

        $body.bind('keydown', function (event) {
          if (!scope.opened) {
            return;
          }

          var which = event.which;
          if (which === keys_codes.esc) {
            scope.closeGallery();
          } else if (which === keys_codes.right || which === keys_codes.enter) {
            scope.nextImage();
          } else if (which === keys_codes.left) {
            scope.prevImage();
          }

          scope.$apply();
        });


        var smartScroll = function (index) {

          $timeout(function () {
            var thumbWrapper = document.querySelectorAll('.ng-thumbnails');

            // TODO: Refactor if statement

            if (index != 0 && ((scope.imagesAll.length - 7) != index) && scope.firstOpen == false) {
              thumbWrapper[0].scrollLeft = 68 * index + 2;
            } else {
              if ((scope.imagesAll.length - 7) == index) {
                thumbWrapper[0].scrollLeft = 68 * index + 4;
              } else {
                thumbWrapper[0].scrollLeft = 68 * index;
              }

            }

            scope.firstOpen = false;

          }, 100);

        };

      }
    };
  }
})();
