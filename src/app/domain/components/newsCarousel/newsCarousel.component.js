(function () {

  angular.module('Sales')
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

      let preSlides = _.map(newsMessages, newsMessage => {

        let slide = _.pick(newsMessage, ['id', 'subject']);

        let picture = _.first(newsMessage.pictures);

        if (picture && picture.srcThumbnail) {
          slide.srcThumbnail = picture.srcThumbnail;
          slide.idx = idx++;
        }

        return slide;

      });

      vm.slides = _.filter(preSlides, 'srcThumbnail');

    }

  }

})();
