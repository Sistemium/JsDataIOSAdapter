(function () {

  angular.module('webPage')
    .service('FullScreenService', FullScreenService);

  function FullScreenService($templateRequest, $compile, $timeout, $window, $document, $rootScope) {

    let fullScreenElement;

    return {

      openFullScreen(content, params, options = { cls: null }) {

        const $body = $document.find('body');

        $templateRequest('app/components/gallery/fullScreenTemplate.html')
          .then(html => {
            const template = angular.element(html);
            $body.append(template);
            fullScreenElement = $compile(template)(newScope(options));
            // $body.bind('keydown', onKeyDown);
            // return $templateRequest(contentUrl);
          })
          .then(() => {
            const contentElement = $document.find('full-screen-content');
            const template = angular.element(content);
            contentElement.append(template);
            const scope = $rootScope.$new(true);
            $compile(template)(_.defaults(scope, params));
          })
          .catch(err => {
            console.error('openFullScreen:error', err);
          });

        // $scope.opened = true;

      },

    };

    function newScope({ cls }) {

      const scope = $rootScope.$new(true);

      return _.assign(scope, {
        cls,
        hasNext() {
        },
        hasPrev() {
        },
        closeClick() {
          fullScreenElement.remove();
          scope.$destroy();
        },
      })

    }

  }

})();
