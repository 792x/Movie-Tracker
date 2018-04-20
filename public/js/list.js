(function() {
  
  // Give functionsTitle.js time to set id .add-to-watch element
  run = function() {
      var id = $('.relative').attr('id');
      var once = true;     
      
      // Try to connect and initialize socket
      try {
          var socket = io.connect('http://2id60.win.tue.nl:10091');
      } catch (e) { 
          console.log('Connection error');
      }

      // If successful
      if(socket !== undefined) {
          // Ask server if user is logged in
          socket.emit('logged');
          
          // If so
          socket.on('loggedin', function() {
              // Ask server is the movie exists in any list of user
              socket.emit('checkExistence', {id: id});
          });
          
          socket.on('existence', function(added, list) {
              var exists = added;
              console.log(list);
              
              if(exists == undefined) {
                  alert("The database could not be reached, please refresh the page if you want to add/remove this title");
              } 
              
              if(!exists) {
                  appendPlus();
                  var windowWidth = window.innerWidth;
                  if(windowWidth < 505) {
                      $('.divSelect').hide();
                  }
                  if(windowWidth > 505) {
                      $('.divSelect').fadeIn();
                  }
              } else if (exists) {
                  appendMinus();
              }
              
              if(list == 'to-watch' && once) {
                  setFeedback('On your to-watch list');
                  once = false;
              } else if(list == 'watched' && once) {
                  setFeedback('On your watched list');
                  once = false;
              } else if(once) {
                  setFeedback('Not on your lists');
                  once = false;
              }
               
              if($('.add-to-watch').length > 0) {
                  $('.add-to-watch').click(function(e){
                      var rating = $('#ratingSelect option:selected').val();
                      //gebruik $('#ratingSelect option:selected').val() om de geselecteerde rating te gebruiken , console.log voor testing purposes

                      socket.emit('addToWatch', {id: id, rating: rating});
                      removePlus();
                      socket.emit('repeat');
                  });
              }
              
              if($('.remove-to-watch').length > 0) {
                  $('.remove-to-watch').click(function(e) {
                      socket.emit('removeToWatch', {id: id});
                      removeMinus();
                      socket.emit('repeat');
                  });
              }
          });
          
          // When clicked on element, pass the title through to server.js (which then inserts it in database)
          socket.on('addedWatched', function() {
              console.log('added');
              setFeedback('Added to your watched list');
          });
          
          socket.on('addedPlan', function() {
              console.log('added');
              setFeedback('Added to your to-watch list');
          });
          
          socket.on('removed', function() {
              console.log('removed');
              setFeedback('Removed from your list');
          });
      }
  };
  
  function appendPlus() {
      $('.float-right').append('<span class="fa fa-1x fa-plus-circle corner wow bounceIn add-to-watch"></span><div class="divSelect"><select class="rSelect" id="ratingSelect"><option>-</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></div>');
      $("#ratingSelect").simpleselect();
  }
  
  function appendMinus() {
      $('.float-right').append('<span class="fa fa-1x fa-minus-circle corner wow bounceIn remove-to-watch"></span>');
  }
  
  function removePlus() {
      $('.fa-plus-circle').remove();
      $('.divSelect').remove()
  }
  
  function removeMinus() {
      $('.fa-minus-circle').remove(); 
  }
  
  function setFeedback(f) {
      $('.feedback-title').remove();
      $('.feedback').append('<h5 class="feedback-title">' + f + '</h5>');
  }
})();
