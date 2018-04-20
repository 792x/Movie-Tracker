(function () {
    $('#planTitle').hide();
    $('#tablePlan').hide();
    $('#watchedTitle').hide();
    $('#tableWatched').hide();
    $('#usernameTitle').hide();
    $('.spinnerPlan').hide();
    $('.spinnerWatched').hide();
    $('#hrPlan').hide();
    $('#hrWatched').hide();
    
    populatePage(); 
    
    function populatePage() {
          var loggedIn = null;
          var path = window.location.search;
          path = path.replace('?', '');
          var email = atob(path);
          
          try {
              var socket = io.connect('http://2id60.win.tue.nl:10092');
          } catch (e) { 
              console.log('Connection error');
          }
          
          if(socket !== undefined) {
              var username = ''; // Declare hier de user info variabelen die je nodig hebt
              
              if (path == '') { // In het geval dat je naar je eigen userpage gaat (en de email dus te vinden is in server.js)
                  socket.emit('requestuserinfo'); // Hij doet een request naar server.js zonder email-waarde
              } else { // In het geval dat je naar andermans userpage gaat (en de email dus komt van de url, en dan na de decryption)
                  socket.emit('requestinfo', email); // Hij doet een request naar server.js met email-waarde
              }
              
              // Code ontvangt hier userinfo data van server.js
              socket.on('userinfo', function(data) {
                  loggedIn = data.logged;
                  email = data.emails;
                  // Geef hier de user info variabelen de juiste value uit data

                  // SPOOF URL with sharable link, temp solution, email value empty if not logged in, email value does not clear if logged out.
                  var newUrl = 'userpage?' + btoa(email);
                  history.pushState({}, null, newUrl);

                  showEmail(email); 
                  // Verwijs hier naar functies die de page populaten, geef daarvoor ofc de variables wel door

                  // Eenmaal alle userinfo geplaatst: op naar de list info
                  socket.emit('list', email); // We sturen 'list' met email naar server.js (remember: email is wat we gebruiken om de juiste collectie te pakken)
                  
              });
              
                           
              socket.on('fail', function() {
                  window.location.href = "/login";
              });
              
              // En dan krijgen we alle movies terug (dit is min of meer een callback)
              socket.on('plan', function(movieslist) {
                  $('.movie-row').remove();
                  var movies = movieslist;
                  var counter = 0;
                  
                  // En daar staan dan verborgen in objecten de imdbIDs die we gaan gebruiken om de list te populaten
                  
                  for(i = 0; i < movies.length; i++) {
                    (function(i) {
                      var id = movies[i].id;
                      var rank = movies[i].rank;
                      var rating = movies[i].rating;
                      
                      if(rank == undefined) {
                          rank = '';
                      }
                      
                      if(rating == undefined) {
                          rating = '';
                      }
                      
                      // OMDB api callen voor spul om toe te voegen aan list;
                      $.getJSON('http://www.omdbapi.com/?i=' + id + '&type=movie&y=&plot=short&r=json&tomatoes=true', function(json) {
                            var title = json.Title; // de info uit de call
                            var year = json.Year;
                            var id = json.imdbID;
                            var imdbRating = json.imdbRating;
                            var metaRating = json.Metascore;
                            var tomatoRating = json.tomatoRating;                            
                            
                            $('#tablePlan').append('<tr class="movie-row"><td>' + '<a href="title?movie=' + encodeURI(title) + '+year=' + year + '">' + title + '</a></td> <td>' + year + '</td> <td class="imdbRating">' + imdbRating + '</td> <td class="tomatoRating">' + tomatoRating + '</td> <td class="metaRating">' + metaRating + '</td>' + '<td class="addButtonClass"><strong title="Save title as watched" class="glyphicon glyphicon-ok tableClickables" id="addButton' + id + '"></td><td class="removeButtonClass"></strong><strong title="Remove title from list" class="glyphicon glyphicon-remove tableClickables" id="removeButton' + id + '"></strong></td></tr>');
                            counter += 1;
                            
                            if(counter == movies.length) {
                              console.log("done");
                              hideRatings();
                            }
                            
                            if(loggedIn == true) {
                                $('#addButton' + id).click(function(e) {
                                    e.stopImmediatePropagation();
                                    console.log("Add clicked on: " + id);
                                    
                                    email = email.toLowerCase();
                                    var emailid = {email, id};
                                    console.log(emailid);
                                    $('#tablePlan').hide();
                                    $('#tableWatched').hide();
                                    $('.spinnerPlan').fadeIn();
                                    $('.spinnerWatched').fadeIn();
                                    
                                    socket.emit('addToWatchedList', emailid);
                                });
                                
                                $('#removeButton' + id).click(function(e) {
                                    e.stopImmediatePropagation();
                                    console.log("Remove clicked on: " + id);
                                    
                                    email = email.toLowerCase();
                                    var emailid = {email, id};
                                    console.log(emailid);
                                    $('#tablePlan').hide();
                                    $(".spinnerPlan").fadeIn();
                                    
                                    socket.emit('removeFromList', emailid);
                                });
                            }
                            
                            if (loggedIn != true) {
                                $(".addButtonClass").hide();
                                $(".removeButtonClass").hide();
                            }
                            
                            $(".table").trigger("update");

                      });
                    })(i);
                  }
                  
                  $(".spinner").hide();
                  $('#planTitle').fadeIn("slow");
                  $('#tablePlan').fadeIn("slow");
                  $('#watchedTitle').fadeIn("slow");
                  $('#tableWatched').fadeIn("slow");
                  $('#usernameTitle').fadeIn("slow");
                  $('#hrPlan').fadeIn("slow");
                  $('#hrWatched').fadeIn("slow");
              });
              
              socket.on('watched', function(movieslist) {
                  $('.movie-row-watched').remove();
                  var movies = movieslist;
                  var counter = 0;
                  
                  // En daar staan dan verborgen in objecten de imdbIDs die we gaan gebruiken om de list te populaten
                  for(i = 0; i < movies.length; i++) {
                    (function(i) {
                      var id = movies[i].id;
                      var rank = movies[i].rank;
                      var rating = movies[i].rating;
                      
                      if(rating == undefined) {
                          rating = '-';
                      }
                      
                      // OMDB api callen voor spul om toe te voegen aan list;
                      $.getJSON('http://www.omdbapi.com/?i=' + id + '&type=movie&y=&plot=short&r=json&tomatoes=true', function(json) {
                            var title = json.Title; // de info uit de call
                            var year = json.Year;
                            var id = json.imdbID;
                            var imdbRating = json.imdbRating;
                            var metaRating = json.Metascore;
                            var tomatoRating = json.tomatoRating;                       
                            
                            $('#tableWatched').append('<tr class="movie-row-watched"><td>' + '<a href="title?movie=' + encodeURI(title) + '+year=' + year + '">' + title + '</a></td> <td>' + year + '</td> <td><div id="ratingNumberContainer' + id + '"><div id="ratingNumber' + id + '" class="tableClickables">' + rating + '</div></div></td> <td class="imdbRating">' + imdbRating + '</td> <td class="tomatoRating">' + tomatoRating + '</td> <td class="metaRating">' + metaRating + '</td>' + '<td class="addButtonClass"></strong><strong title="Back to plan-to-watch list" class="glyphicon	glyphicon glyphicon-arrow-up tableClickables" id="buttonAdd' + id + '"></strong></td> <td class="removeButtonClass"></strong><strong title="Remove title from list" class="glyphicon glyphicon-remove tableClickables" id="buttonRemove' + id + '"></strong></td></tr>');
                            counter += 1;
                            console.log("added");
                                                        
                            if(counter == movies.length) {
                              console.log("done");
                              hideRatings();
                            }
                            
                            if(loggedIn == true) {                                
                                $('#buttonRemove' + id).click(function(e) {
                                    e.stopImmediatePropagation();
                                    console.log("Remove clicked on: " + id);
                                    
                                    email = email.toLowerCase();
                                    var emailid = {email, id};
                                    console.log(emailid);
                                    $('#tableWatched').hide();
                                    $(".spinnerWatched").fadeIn();
                                    
                                    socket.emit('removeFromListWatched', emailid);
                                });
                                $('#buttonAdd' + id).click(function(e) {
                                    e.stopImmediatePropagation();
                                    console.log("Back to watch clicked on: " + id);
                                    
                                    email = email.toLowerCase();
                                    var emailid = {email, id};
                                    $('#tablePlan').hide();
                                    $('#tableWatched').hide();
                                    $(".spinnerPlan").fadeIn();
                                    $(".spinnerWatched").fadeIn();
                                    
                                    socket.emit('backToPlan', emailid);
                                });

                                // variable to make the 'toggle' work between showing the selectmenu and the normal rating number
                                var clickable = true;
                                var one = true;
                                // when clicked on number show the dropdown menu and add change listener
                                $('#ratingNumberContainer' + id).bind('click', 'a', function(e){
                                    e.stopImmediatePropagation();
                                    
                                    if (clickable) {
                                        e.stopImmediatePropagation();
                                        console.log("Rating clicked on: " + id);
                                        $('#ratingNumber' + id).remove();
                                        $('#ratingNumberContainer' + id).append('<select class="rSelect2" id="ratingPickerMenu' + id + '"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select>')
                                        $(function () {
                                            // Set standard selected option when user clicks on the rating number, replace '5' with user rating from mongodb database, important because it prevents confusion
                                            $("#ratingPickerMenu" + id).val(rating);
                                        });
                                        clickable = false;
                                        one = true;
                                    }


                                    // listen to change
                                    
                                    $("#ratingPickerMenu" + id).change(function () {
                                        if(one) {
                                            one = false;
                                            console.log("rating selected: " + $(this).val());
                                            $('#ratingNumberContainer' + id).empty();
                                            clickable = true;
                                            
                                            // function to submit rating to mongodb here, user $(this).val() to get the selected item from the menu list, this will only execute when a change event happens in the selectmenu.
                                            var rating = $(this).val();
                                            var data = {email, id, rating};
                                            socket.emit('rating', data);
                                            $('#ratingNumberContainer' +id).append('<div class="ispinner gray animating"><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div><div class="ispinner-blade"></div></div>')
                                        }
                                    });


                                });
                            }
                            
                            if (loggedIn != true) {
                                $(".addButtonClass").hide();
                                $(".removeButtonClass").hide();
                            }
                            
                            $(".table").trigger("update");

                      });
                    })(i);
                  }
                  
                  var windowWidth = $(document).width();
                  if(windowWidth < 550) {
                      $('.imdbRating').hide();
                      $('.tomatoRating').hide();
                      $('.metaRating').hide();
                  }
                  if(windowWidth > 550) {
                      $('.imdbRating').fadeIn();
                      $('.tomatoRating').fadeIn();
                      $('.metaRating').fadeIn();
                  }
                  
                  $('.spinnerPlan').hide();
                  $('.spinnerWatched').hide();
                  $('.spinner').hide();
                  $('#planTitle').fadeIn("slow");
                  $('#tablePlan').fadeIn("slow");
                  $('#watchedTitle').fadeIn("slow");
                  $('#tableWatched').fadeIn("slow");
                  $('#usernameTitle').fadeIn("slow");
              });
              
              socket.on('listplease', function() {
                  setTimeout(function() {
                      socket.emit('list', email);
                  }, 300);
              });
          }
      };
            
      function showEmail(emailq) {
          var brokenEmail = emailq.replace(/@/g, '@<wbr>');
          $('#usernameTitle').append('<h2>' + brokenEmail + '</h2>');
      }
      
      function hideRatings() {
          var windowWidth = window.innerWidth;
          if(windowWidth < 550) {
              $('.imdbRating').hide();
              $('.tomatoRating').hide();
              $('.metaRating').hide();
              $('.title-box-dark').css({"padding-bottom": "0px"});
              $('.extra-space-title').css({"padding-top": "0px", "padding-bottom": "10px"});
          }
          if(windowWidth > 550) {
              $('.imdbRating').fadeIn();
              $('.tomatoRating').fadeIn();
              $('.metaRating').fadeIn();
              $('.title-box-dark').css({"padding-bottom": "40px"});
              $('.extra-space-title').css({"padding-top": "30px", "padding-bottom": "0px"});
          }
      }
      
      $(window).resize(function() {
          hideRatings();
      });         
})();