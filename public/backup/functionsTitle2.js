$(document).ready(function() {
    
    var title = '';
    var year = '';
    var imdbID = '';    
    
    disectURL();
    useOMDBData();
    
    function disectURL() {
        var path = window.location.search;
        
        path = path.replace('?', '');
        path = path.replace(/%20/g, ' ');
            
        var params = path.split("+");
        var temp = '';
        
        for(i = 0; i < params.length; i++) {
           temp = params[i];
           if(temp.includes('movie=')) {
              title = temp.replace('movie=', '');
           } else if(temp.includes('year=')) {
              year = temp.replace('year=', '');
           } else if(temp.includes('imdbID=')) {
              imdbID = temp.replace('imdbID=', '');
           }       
        }
    }
    
    
    function useTMDBData() {
        var searchURL = 'http://api.themoviedb.org/3/search/movie?&query="' + title + '"&year=' + year + '&api_key=a80fc7ec3e107a6a0ebb57c7709f0ef7';
        $.getJSON(searchURL, function(json) {
              var data = json.results;
              var object = data[0];
              if(object != undefined) {
                  var backdropPath = object.backdrop_path;
                  var overview = object.overview;
                  setPlot(overview);
                  if(backdropPath != null) {
                      var imageURL = 'http://image.tmdb.org/t/p/original/' + backdropPath;
                      var imageToAppend = '<img class="img-responsive" src="' + imageURL + '" alt="poster">';
                      $('.backdrop').append(imageToAppend);
                  }
              }
        });
    }

    function setTitle() {
        $('.movie-title').append('<h2 class="left-title">' + title + ' (' + year + ')</h2>');
    }

    function setPlot(overview) {
        $('.overview-plot').append('<div class="col-lg-12 col-md-12 col-xs-12 no-padding sub-text text-left"> <h2>Plot</h2> <hr> <p>' + overview + '</p> </div>');
    }

    function useOMDBData() {
        var movieURL = 'http://www.omdbapi.com/?t=' + title + '&y=' + year + '&i=' + imdbID + '&plot=short&r=json&tomatoes=true';
        $.getJSON(movieURL, function(json) {
              imdbID = json.imdbID;
              title = json.Title;
              year = json.Year;
              setTitle();
              useTMDBData();
              var imdb = json.imdbRating;
              setID();
              var rotten = json.tomatoRating;
              var meta = json.Metascore;

              if(imdb != 'N/A') {
                  $('.imdb').append('<img class="imdb-logo" src="../img/imdblogo.png" alt="IMDb logo">');
                  $('.imdb').append('<h3 class="rating">' + imdb + ' / 10</h3>');
              }
              if(rotten != 'N/A') {
                  $('.rotten').append('<img class="rt-logo" src="../img/rtlogo.png" alt="Rotten Tomatoes logo">');
                  $('.rotten').append('<h3 class="rating">' + rotten + ' / 10</h3>');
              }
              if(meta != 'N/A') {
                  $('.meta').append('<img class="mc-logo" src="../img/metacriticlogo.png" alt="MetaCritic logo">');
                  $('.meta').append('<h3 class="rating">' + meta + ' / 100</h3>');
              }

              var actors = json.Actors;
              var awards = json.Awards;
              var reception = json.tomatoConsensus;
              
              if(actors != 'N/A') {
                  $('.actors').append('<div class="col-lg-12 col-md-12 col-xs-12 no-padding sub-text text-left"> <h2>Actors</h2> <hr> <p>' + actors + '.</p> </div>');
              }
              
              if(awards != 'N/A' && reception != 'N/A') {
                  $('.awards').append('<div class="col-lg-12 col-md-12 col-xs-12 no-padding sub-text text-left"> <h2>Critical Reception</h2> <hr> <p>' + reception + ' <br> ' + awards + '</p> </div>');
              } else if(awards != 'N/A') {
                  $('.awards').append('<div class="col-lg-12 col-md-12 col-xs-12 no-padding sub-text text-left"> <h2>Critical Reception</h2> <hr> <p>' + awards + '</p> </div>');
              } else if(reception != 'N/A'){
                  $('.awards').append('<div class="col-lg-12 col-md-12 col-xs-12 no-padding sub-text text-left"> <h2>Critical Reception</h2> <hr> <p>' + reception + '</p> </div>');
              }
        });
    }
    
    function setID() {
        $('.relative').attr('id', imdbID);
    }
    

});
