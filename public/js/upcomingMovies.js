$(document).ready(function() {

    getUpcoming();

    function getUpcoming(){
        var upcomingMovies = 'http://api.themoviedb.org/3/movie/upcoming?api_key=a80fc7ec3e107a6a0ebb57c7709f0ef7';
        $.getJSON(upcomingMovies, function(upcomingJson){
            console.log(upcomingJson);

            for(var i=0; i<9; i++){
                var upcomingData = upcomingJson.results[i];

                var date = upcomingData.release_date;
                var periods = date.split("-");
                var monthNumber = periods[1]; 
                var date = periods[2];
                
                var year = periods[0];
                
                var month = '';
                switch(monthNumber){
                    case '01':
                        month = 'January '
                        break;
                    case '02':
                        month = 'February '
                        break;
                    case '03':
                        month = 'March '
                        break;
                    case '04':
                        month = 'April '
                        break;
                    case '05':
                        month = 'May'
                        break;
                    case '06':
                        month = 'June '
                        break;
                    case '07':
                        month = 'July '
                        break;
                    case '08':
                        month = 'August '
                        break;
                    case '09':
                        month = 'September '
                        break;
                    case '10':
                        month = 'October '
                        break;
                    case '11':
                        month = 'November '
                        break;
                    case '12':
                        month = 'December '
                        break;
                }
                
                var movieURL = "title?movie="+ upcomingData.title +"+year="+ year;

                if(i%2 == true) {
                    $('.upcoming').append('<tr><td><a href="'+ movieURL +'"><h3>' + upcomingData.title + '</h3><h4>In cinemas ' + month + date + '</h4></a></td>' +
                        '<td><a href="'+ movieURL +'"><span class="fa fa-1x fa-angle-right wow bounceIn"></span></a></td></tr>');
                } else{
                    $('.upcoming').append('<tr class="lighter"><td><a href="'+ movieURL +'"><h3>' + upcomingData.title + '</h3><h4>In cinemas ' +  month + date + '</h4></a></td>' +
                        '<td><a href="'+ movieURL +'"><span class="fa fa-1x fa-angle-right wow bounceIn"></span></a></td></tr>');
                }
            }
        });
    }
});




