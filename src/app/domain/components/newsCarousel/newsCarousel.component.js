(function () {

  angular.module('webPage')
    .component('newsCarousel', {

      templateUrl: 'app/domain/components/newsCarousel/newsCarousel.html',

      controller: newsCarouselController,
      controllerAs: 'vm'

    });


  function newsCarouselController(Schema, $scope, $state) {


    const {NewsMessage} = Schema.models();

    const vm = _.assign(this, {
      interval: 5000,
      imageClick
    });

    const options = {bypassCache: true};

    let filter = NewsMessage.meta.filterActual();

    NewsMessage.findAllWithRelations(filter, options)(['NewsMessagePicture', 'UserNewsMessage'])
      .then(makeSlides);

    /*
    Functions
     */

    function imageClick(slide) {
      $state.go('newsFeed.show', {newsMessageId: slide.id});
    }

    function makeSlides(newsMessages) {

      let idx = 0;

      let slides = [];

      newsMessages = _.orderBy(newsMessages, ['cts', 'deviceCts'], ['desc', 'desc']);

      _.each(newsMessages, newsMessage => {

        if (!newsMessage.forceShow && !newsMessage.isUnrated()) {
          return;
        }

        let {pictures} = newsMessage;

        if (!pictures.length) {
          pictures = [{srcThumbnail: 'images/new-message.png'}];
        }

        let slide = _.pick(newsMessage, ['id', 'subject']);

        slide.srcThumbnail = pictures[0].srcThumbnail;
        slide.idx = idx++;

        slides.push(slide);

      });

      vm.slides = slides;

    }

  }

})();
