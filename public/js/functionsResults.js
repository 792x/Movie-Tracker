$(document).ready(function() {
    // Extract keywords from URL
    var keywords = window.location.search;
    keywords = keywords.replace('?', '');
    keywords = keywords.replace(/%20/g, ' ');
    
    showResultTitle();
    
    getMovies();

    var page = 2;
    checkIfMore();

    // Get more movies on click of 'view more'
    $('#viewMore').click(getMoreMovies);
    
    // Direct to /title page with relevant movie info in URL on click of row
    $('table').delegate('tr', 'click', function() {
        var titleAndYear = $(this).attr('id');
        
        var params = titleAndYear.split("/$&");
        var title = params[0];
        var year = params[1];
        
        window.location.href = 'title?movie=' + title + '+year=' + year;
    });

    // Get movies from OMDBapi with keywords
    function getMovies() {
            $.ajax({
                type: 'Get',
                dataType: 'xml',
                url: 'http://www.omdbapi.com/?s=' + keywords + '&type=movie&y=&plot=short&r=xml',
            }).then(function(data){
                postResults(data);
                postPosters();
            });
    }
    
    // Show results title with keywords
    function showResultTitle() {
        $('.result-title').append($('<h2>', {html: 'Results for "' + keywords + '"'}));
    }

    // Check if OMDBapi has movies on the next page
    function checkIfMore() {
        $.getJSON('http://www.omdbapi.com/?s=' + keywords + '&type=movie&y=&plot=short&r=json&page=' + page, function(json) {
              if(json.Response == 'False') {
                  $('#viewMore').remove();
              }
        });
    }
    
    // Get more movies from OMDBapi on the next page
    function getMoreMovies() {
        $.ajax({
            type: 'Get',
            dataType: 'xml',
            url: 'http://www.omdbapi.com/?s=' + keywords + '&type=movie&y=&plot=short&r=xml&page=' + page,
        }).then(function(data){
            postResults(data);
	    postPosters();
            page += 1;
        });

        checkIfMore();
    }

    // Append rows with movie information per fetched movies
    function postResults(data) {
      $(data).find('result').each(function() {
          var result = $(this);
          var title = result.attr("title");
          var year = result.attr("year");
          var id = result.attr("imdbID");

          var information = '<h3>' + title + ' (' + year + ')</h3>';
          var toAppend = '';
          toAppend = '<tr class="result" id="' + title + '/$&' + year + '"> <td id="' + id + '" class="poster"> </td> <td class="description">' + information + '</td> </tr>';

          $('.results').append(toAppend);
      });
    }

    function postPosters() {

	$('.poster').each(function() {
	  var id = $(this).attr('id');	
	  if($('#poster' + id).length === 0) {
	    $.getJSON('http://api.themoviedb.org/3/find/'+ id +'?external_source=imdb_id&api_key=a80fc7ec3e107a6a0ebb57c7709f0ef7', function(json) {
	      var data = json.movie_results;
	      var result = data[0]
              var imgsrc = '';

	      if(result != undefined) {
	      	imgsrc = 'http://image.tmdb.org/t/p/original/' + result.poster_path;
	      } else {
	        imgsrc = 'unknown';
	      }

	      if(imgsrc != 'unknown') {
	        $('#' + id).append('<img id="poster'+ id +'" class="img-poster" src="' + imgsrc + '" alt="poster">');
	      } else {
		$('#' + id).append('<img id="poster' + id + '" class="img-poster" src="http://2id60.win.tue.nl/~s140138/public/img/Unknown.jpg">');
	      }

              setPostersize();

            });
	  }
       });
   }
	    
 

    
    // Set poster size and margins for upper div with title according to screen width
    function setPostersize() {
        var windowWidth = $(window).width();
        var imgWidth = 108;
        var imgHeight = 150;
        var tdWidth = 128;

        if(windowWidth <= 512) {
            var d = 512 - windowWidth;
            var imgWidth = imgWidth - (0.27358490566 * d);
            var imgHeight = imgHeight - (0.40566037735 * d);

            if(windowWidth <= 300) {
                imgWidth = 50;
                imgHeight = 64;
            }
        }

        tdWidth = 1.18518518518 * imgWidth;
        var tdHeightString = imgHeight + 'px';

        $('.img-poster').css({"width": imgWidth + "px"});
        $('.img-poster').css({"height": imgHeight + "px"});
        $('.poster').css({"width": tdWidth + "px"});
        $('head').append("<style>.row-link::before{ height:" + tdHeightString + " }</style>");
    }

    $(window).resize(function() {
        setPostersize();
    });

});
