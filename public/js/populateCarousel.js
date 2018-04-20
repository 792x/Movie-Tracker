$(document).ready(function() {
    
    postPosters();

    function postPosters() {
        $.getJSON('http://api.themoviedb.org/3/movie/popular?api_key=a80fc7ec3e107a6a0ebb57c7709f0ef7', function(json) {
              var data = json.results;
              for(i = 0; i < 5; i++) {
                  posterURL = 'http://image.tmdb.org/t/p/original/' + data[i].poster_path;
                  link = 'title?movie=' + data[i].title;
                  if (i == 0) {
                      $('.posterForCarousel').append('<div class="item active"><a href="' + link + '"><img class="wide" src="' + posterURL + '" alt="poster"></a></div>');
                  } else {
                      $('.posterForCarousel').append('<div class="item"><a href="' + link + '"><img class="wide" src="' + posterURL + '" alt="poster"></a></div>');
                  }
              }
        });
    }
});