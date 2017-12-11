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

    let filter = NewsMessage.meta.filterActual({forceShow: true});

    NewsMessage.bindAll(filter, $scope, 'vm.newsMessages', makeSlides);

    NewsMessage.findAllWithRelations(filter, options)('NewsMessagePicture')
      .then(makeSlides);

    /*
    Functions
     */

    function imageClick(slide) {
      $state.go('newsFeed.show', {newsMessageId: slide.id});
    }

    function makeSlides() {

      let {newsMessages} = vm;

      let idx = 0;

      let slides = [];

      _.each(newsMessages, newsMessage => {

        _.each(newsMessage.pictures, picture => {

          if (!picture.srcThumbnail) {
            return;
          }

          let slide = _.pick(newsMessage, ['id', 'subject']);

          slide.srcThumbnail = picture.srcThumbnail;
          slide.idx = idx++;

          slides.push(slide);

        });

      });

      vm.slides = slides;

    }

  }

})();
