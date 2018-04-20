$(function() {
    var spotlightURL = 'http://api.themoviedb.org/3/movie/top_rated?&api_key=a80fc7ec3e107a6a0ebb57c7709f0ef7';
    
    $.getJSON(spotlightURL, function(json) {
        var data = json.results;
        var object = data[0];
        var object2 = data[1];
        var object3 = data[2];
        
        var posterURL = 'http://image.tmdb.org/t/p/original/' + object.poster_path;
        var poster2URL = 'http://image.tmdb.org/t/p/original/' + object2.poster_path;
        var poster3URL = 'http://image.tmdb.org/t/p/original/' + object3.poster_path;
        
        $('.spotlight-poster').append('<a href="title?movie=' + object.title + '"><img class="img-responsive spot-poster wide" src="'+ posterURL +'"></a>');
        $('.spotlight-poster2').append('<a href="title?movie=' + object2.title + '"><img class="img-responsive spot-poster wide" src="'+ poster2URL +'"></a>');
        $('.spotlight-poster3').append('<a href="title?movie=' + object3.title + '"><img class="img-responsive spot-poster wide" src="'+ poster3URL +'"></a>');
    });
});
