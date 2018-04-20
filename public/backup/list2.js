(function() {
  $('.ratingSelect').hide();
  var id = '';
  
  // Give functionsTitle.js time to set id .add-to-watch element
  setTimeout(function() {
      id = $('.relative').attr('id');

      // Try to connect and initialize socket
      try {
          var socket = io.connect('http://127.0.0.1:8080');
      } catch (e) { 
          console.log('Connection error');
      }

      // If successful
      if(socket !== undefined) {
          socket.emit('checkExistence', {id: id});
          
          socket.on('existence', function(added) {
              var exists = added;
              if(exists == undefined) {
                  alert("The database could not be reached, please refresh the page if you want to add/remove this title");
              } 
              
              if(!exists) {
                  appendPlus();
              } else if (exists) {
                  appendMinus();
              }
              console.log(exists);
              
              setTimeout(function() {
                  console.log("add to watch is here");
                  if($('.add-to-watch').length > 0) {
                      $('.add-to-watch').click(function(e){
                          console.log(id);
                          socket.emit('addToWatch', {id: id});
                          removePlus();
                          socket.emit('repeat');
                      });
                  }
                  
                  if($('.remove-to-watch').length > 0) {
                      console.log("And Here");
                      $('.remove-to-watch').click(function(e){
                          console.log(id);
                          socket.emit('removeToWatch', {id: id});
                          removeMinus();
                          socket.emit('repeat');
                      });
                  }
              }, 1500);
          });
          
          // When clicked on element, pass the title through to server.js (which then inserts it in database)
      
          socket.on('error', function(err) {
              alert("There occured an error when accessing the database, please refresh the page");
          });
          
          socket.on('added', function(err) {
              alert("The movie is added to your list.");
          });
          
          socket.on('removed', function(err) {
              alert("The movie is removed from your list.");
          });
              
      }
  }, 500);
  
  function appendPlus() {
      $('.float-right').append('<span class="fa fa-1x fa-plus-circle corner add-to-watch"></span>');
      $('.ratingSelect').show();
  }
  
  function appendMinus() {
      $('.float-right').append('<span class="fa fa-1x fa-minus-circle corner wow bounceIn remove-to-watch"></span>');
      $('.ratingSelect').hide();
  }
  
  function removePlus() {
      $('.fa-plus-circle').remove();
      $('.ratingSelect').hide();
  }
  
  function removeMinus() {
      $('.fa-minus-circle').remove();
      $('.ratingSelect').hide();
  }
})();
