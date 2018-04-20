$(document).ready(function () {
    function disectURL() {
        var path = window.location.search;

        path = path.replace('?', '');
        path = path.replace(/%20/g, ' ');

        var params = path.split("+");
        var temp = '';

        for (i = 0; i < params.length; i++) {
            temp = params[i];
            if (temp.includes('movie=')) {
                title = temp.replace('movie=', '');
            } else if (temp.includes('year=')) {
                year = temp.replace('year=', '');
            } else if (temp.includes('imdbID=')) {
                imdbID = temp.replace('imdbID=', '');
            }
        }
    }
});
