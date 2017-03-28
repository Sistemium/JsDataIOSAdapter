'use strict';

(function () {

  angular.module('webPage')
    .directive('ngGallery', ngGallery);

  function GalleryController($scope, $q, $templateRequest, $compile, $timeout, $document, $window) {

    const vm = this;
    const $body = $document.find('body');

    let fullscreenElement;

    _.assign(vm, {

      thumbnailClick,
      fullScreenThumbnailClick,

      nextImageClick: setNextImage,
      prevImageClick: setPrevImage,

      closeGalleryClick: cleanup,

      deleteClick

    });

    $scope.$on('$destroy', cleanup);

    /*
     Functions
     */

    function thumbnailClick (img) {

      if (!img) return;

      $scope.index = $scope.imagesAll.indexOf(img);

      const fn = $scope.thumbnailClickFn() || openGallery;

      return _.isFunction(fn) && fn(img);

    }

    function fullScreenThumbnailClick (img) {
      $scope.index = $scope.imagesAll.indexOf(img);
      showImage(img);
    }

    function deleteCurrentImage() {

      let imageModel = $scope.imagesAll[$scope.index];

      if (!imageModel) {
        return console.error('ngGallery.deleteCurrentImage Failed to get image model');
      }

      imageModel.DSDestroy()
        .then(cleanup)
        .catch(cleanup);

    }

    function deleteClick() {
      if ($scope.confirmDelete) deleteCurrentImage();
      $scope.confirmDelete = !$scope.confirmDelete;
    }

    function cleanup() {
      $scope.opened = false;
      $body.unbind('keydown', onKeyDown);
      fullscreenElement && fullscreenElement.remove();
    }

    function setNextImage() {
      setImageByIndex($scope.index + 1);
    }

    function setPrevImage() {
      setImageByIndex($scope.index - 1);
    }

    function setImageByIndex(index) {
      let images = $scope.imagesAll;
      index = (images.length + index) % images.length;
      showImage(images[$scope.index = index]);
    }

    function openGallery(image) {

      $templateRequest('app/components/gallery/galleryFullscreen.html')
        .then((html) => {
          let template = angular.element(html);
          $body.append(template);
          fullscreenElement = $compile(template)($scope);
          $body.bind('keydown', onKeyDown);
          scrollThumbnailsToCurrent();
        });

      $scope.opened = true;

      return angular.isDefined(image) && showImage(image);

    }

    function loadImage(img) {

      return $q((resolve, reject) => {

        const image = _.assign(new Image(), {

          onload: function () {
            if (this.complete === false || this.naturalWidth === 0) {
              reject();
            }
            resolve(image);
          },

          onerror: reject,
          src: img.srcFullscreen

        });

      });

    }

    function showImage(img) {

      $scope.loading = true;
      $scope.confirmDelete = false;

      vm.currentImage = img;

      loadImage(img)
        .then((res) => {
          $scope.currentImageSrc = res.src;
          // scope.id = img.name;
          // smartScroll(scope.index);
        })
        .catch(() => {
          $scope.imageLoadingError = true;
        })
        .finally(() => {
          $scope.loading = false;
        });

    }

    const keyCodes = {
      enter: 13,
      esc: 27,
      left: 37,
      right: 39
    };

    function onKeyDown(event) {

      if (!$scope.opened) {
        return console.error('!scope.opened');
      }

      let which = event.which;

      if (which === keyCodes.esc) {
        cleanup();
      } else if (which === keyCodes.right || which === keyCodes.enter) {
        setNextImage();
      } else if (which === keyCodes.left) {
        setPrevImage();
      }

      $scope.$apply();

    }

    function scrollThumbnailsToCurrent() {

      $timeout(() => {

        let index = $scope.index;

        let thumbWrapper = $window.document.getElementById('ng-thumbnails-scroll');

        // TODO: Refactor if statement

        if (index != 0 && (($scope.imagesAll.length - 7) != index) && $scope.firstOpen == false) {
          thumbWrapper.scrollLeft = 70 * index + 2;
        } else {
          if (($scope.imagesAll.length - 7) == index) {
            thumbWrapper.scrollLeft = 70 * index + 2;
          } else {
            thumbWrapper.scrollLeft = 70 * index;
          }

        }

        $scope.firstOpen = false;

      }, 0);

    }

  }

  function ngGallery($timeout) {

    const defaults = {
      baseClass: 'ng-gallery',
      thumbClass: 'ng-thumb',
      templateUrl: 'app/components/gallery/galleryTemplate.html'
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

        function hideNavElements() {
          $timeout(function () {
            scope.showNavElems = false;
          }, 2000);
        }

        hideNavElements();

        scope.showNavElems = true;
        scope.index = 0;
        scope.opened = false;
        scope.firstOpen = true;

        scope.setHovered = (image) => {
          if (_.isFunction(scope.imageHoveredFn())) {
            scope.imageHoveredFn()(image);
          }
        };

      }

    };

  }

})();
