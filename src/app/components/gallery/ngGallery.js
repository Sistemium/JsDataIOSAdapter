'use strict';

(function () {

  angular.module('webPage')
    .directive('ngGallery', ngGallery);

  function GalleryController($scope) {

    const vm = this;

    _.assign(vm, {

      thumbnailClick: function (img) {

        if (!img) return;

        $scope.index = $scope.imagesAll.indexOf(img);

        const fn = $scope.thumbnailClickFn() || $scope.openGallery;

        return _.isFunction(fn) && fn(img);

      }

    });

  }

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

      controller: GalleryController,

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

        function loadImage(img) {

          return $q((resolve, reject) => {

            const image = new Image();

            scope.loading = true;

            image.onload = function () {
              scope.loading = false;
              if (this.complete === false || this.naturalWidth === 0) {
                reject();
              }
              resolve(image);
            };

            image.onerror = function (err) {
              reject(err);
            };

            image.src = img.smallSrc;

          });

        }

        function showImage(img) {

          loadImage(img)
            .then(function (res) {
              scope.currentImageSrc = res.src;
              // scope.id = img.name;
              // smartScroll(scope.index);
            });

          scope.confirmDelete = false;

        }

        var fullscreenElement;

        //var defineClass = function (width, height) {
        //  scope.useWide = false, scope.useTall = false;
        //  width >= height ? scope.useWide = true : scope.useTall = true;
        //};

        scope.changeImage = function (img, index) {
          scope.index = index;
          showImage(img);
        };

        scope.nextImage = function () {
          setImageByIndex(scope.index + 1);
        };


        scope.prevImage = function () {
          setImageByIndex(scope.index - 1);
        };

        function setImageByIndex(index) {
          showImage(scope.imagesAll[scope.index = (scope.imagesAll.length + index) % scope.imagesAll.length]);
        }

        scope.setHovered = function (image) {
          if (_.isFunction(scope.imageHoveredFn())) {
            scope.imageHoveredFn()(image);
          }
        };

        scope.openGallery = function (image) {

          $templateRequest('app/components/gallery/galleryFullscreen.html')
            .then(function (html) {
              let template = angular.element(html);
              $body.append(template);
              fullscreenElement = $compile(template)(scope);
              $body.bind('keydown', onKeyDown);
            });

          scope.opened = true;

          $timeout(smartScroll);

          return angular.isDefined(image) && showImage(image);

        };

        function cleanup() {
          scope.opened = false;
          $body.unbind('keydown', onKeyDown);
          fullscreenElement && fullscreenElement.remove();
        }

        scope.$on('$destroy', cleanup);

        scope.closeGallery = cleanup;

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

        function onKeyDown (event) {

          if (!scope.opened) {
            return console.error('!scope.opened');
          }

          let which = event.which;

          if (which === keys_codes.esc) {
            scope.closeGallery();
          } else if (which === keys_codes.right || which === keys_codes.enter) {
            scope.nextImage();
          } else if (which === keys_codes.left) {
            scope.prevImage();
          }

          scope.$apply();

        }

        function smartScroll () {

          $timeout(function () {

            let index = scope.index;

            let thumbWrapper = document.querySelectorAll('.ng-thumbnails');

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

          }, 0);

        }

      }
    };
  }
})();
