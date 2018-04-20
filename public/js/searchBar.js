$(document).ready(function() {
    // On click
    $("#search").click(composeQuery);
    
    // Direct to results page with quered keywords in url
    function composeQuery() {
        event.preventDefault();
        var keywords = $("#keyword").val();
        if (keywords) {
            location.href = 'results?' + keywords;
        }
    }
});
