var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var mongolabURL = 'mongodb://Client:Client@ds037195.mongolab.com:37195/chat';
var client = require('socket.io').listen(10091).sockets;
var clientelle = require('socket.io').listen(10092).sockets;
var app = express();

var userinfo = {};

//using stormpath api
var stormpath2 = require('stormpath');
var client2 = null;
var home = process.env[(process.platform === 'win32' ? 'USERPROFILE' : 'HOME')];
//stormpath api keyfile
var apiKey = home + '/.stormpath/apiKey.properties';

var client2 = new stormpath2.Client({ apiKey: apiKey });
//application link on stormpath
var appHref = 'https://api.stormpath.com/v1/applications/574y1Np84XcqRAi3FYQH1q';
//retreives information from our application on stormpath
client2.getApplication(appHref, function (err, app) {
    if (err) throw err;
    console.log(app);
});

//initialization of the web app and setting up stormpath
app.set('views', './views');
app.set('view engine', 'jade');
app.use('/~s140138', express.static(__dirname + '/public'));
app.use(stormpath.init(app, {
    web: {
        login:{
            uri: '/~s140138/login',
            nextUri: '/~s140138'
        },
        logout:{
            uri: '/~s140138/logout',
            nextUri: '/~s140138'
        },


    register: {
      enabled: true,
      uri: '/register',
      nextUri:'/~s140138',
      fields: {
        displayname: {
          label: 'Display Name',
          name: 'displayname',
          placeholder: 'Display Name',
          type: 'text',
          enabled: true,
          required: true
        }
      },
      fieldOrder: ['givenName', 'surname', 'displayname','email','password']
    },
    profile: {
        
    }
  },
  website: true,
  expand: {
    customData: true
  },
}));

var email = '';

//express routes for different views
app.get('/~s140138', function(req, res) {
  res.render('index', {
    title: 'Welcome'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to 'results' view
app.get('/~s140138/results', function(req, res) {
  res.render('results', {
    title: 'Results'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to 'title' view
app.get('/~s140138/title', function(req, res) {
  res.render('title', {
    title: 'Movie'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to 'about' view
app.get('/~s140138/about', function(req, res) {
  res.render('about', {
    title: 'About'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to 'userpage' view (lists)
app.get('/~s140138/userpage', function(req, res) {
  res.render('userpage', {
    title: 'Profile'
  });
  if(req.user != undefined) {
    email = req.user.email;    
  }
  else {
      email = '';
  }
});

//route to contact form, not in use
app.get('/~s140138/contact-us', function(req, res) {
  res.render('contact-us', {
    title: 'Contact'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to list view, not in use
app.get('/~s140138/list', function(req, res) {
  res.render('list', {
    title: 'Lists'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
  else {
      email = '';
  }
});

//route to 'settings/profile' view, stormpath
app.use('/~s140138/profile',stormpath.loginRequired,require('./profile')());
app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
  app.listen(10093);
});


// Connection with the mongo database is mode with key and username + password
mongo.connect(mongolabURL, function(error, db) {
    assert.equal(null, error);
    
    clientelle.on('connection', function(socket) {
        socket.on('requestinfo', function(emailad) {

            //returns info from account with email that comes from userinfo.js
            client2.getAccounts({ email: emailad }, function (err, accounts) {
                if (err) throw err;
                accounts.each(function (account, index) {
                    var name = account.givenName;
                    var surname = account.surname;
                    var emails = emailad;
                    var logged = false;
                    
                    if(email == emails) {
                      logged = true;
                    }
                    
                    userinfo = {name, surname, emails, logged}; //add userinfo here
                    socket.emit('userinfo', userinfo); //userinfo gets sent to userinfo.js
                });
            });
        });
        
        socket.on('requestuserinfo', function() {
            //returns info from account with email that is present in server.js, the logged in user
            if (email != '') {
                client2.getAccounts({ email: email }, function (err, accounts) {
                    if (err) throw err;
                    accounts.each(function (account, index) {
                        var name = account.givenName;
                        var surname = account.surname;
                        var emails = email;
                        var logged = true; 
                                    
                        userinfo = {name, surname, emails, logged}; //add userinfo here
                        socket.emit('userinfo', userinfo); //userinfo gets sent to userinfo.js
                    });
                });
            } else {
                socket.emit('fail');
            }
        });
        //function for user list
        socket.on('list', function(email) {
            var collectionToGet = db.collection('moviesToWatch:' + email);
            var movies = collectionToGet.find({}).toArray(function(err, res) {
                if(err) {
                    socket.emit('faulty');    
                } else {
                    socket.emit('plan', res);
                }
            });
            var collectionToGet2 = db.collection('moviesWatched:' + email);
            var movies = collectionToGet2.find({}).toArray(function(err, res) {
                if(err) {
                    socket.emit('faulty');    
                } else {
                    socket.emit('watched', res);
                }
            });
        });
        
        //function for adding movies to watched list
        socket.on('addToWatchedList', function(emailid) {
            var colToRemoveFrom = db.collection('moviesToWatch:' + emailid.email);
            var colToAddTo = db.collection('moviesWatched:' + emailid.email);
            var id = emailid.id;
            
            colToRemoveFrom.remove({id : id});
            
            var cursor = colToAddTo.find({id : id}).toArray(function(err, res) {
                if (res.length == 0) {
                    colToAddTo.insert({id: id});
                }
                socket.emit('listplease');
            });            
        });
        
        //function for removing movies from list
        socket.on('removeFromList', function(emailid) {
            var col = db.collection('moviesToWatch:' + emailid.email);
            var id = emailid.id;
            
            var cursor = col.find({id : id}).toArray(function(err,res) {
                if (res.length > 0) {
                    col.remove({id : id});
                }
                socket.emit('listplease');
            });  
        });
        
        //function for removing movies from watched list
        socket.on('removeFromListWatched', function(emailid) {
            var col = db.collection('moviesWatched:' + emailid.email);
            var id = emailid.id;
            
            var cursor = col.find({id : id}).toArray(function(err,res) {
                if (res.length > 0) {
                    col.remove({id : id});
                }
                socket.emit('listplease');
            });  
        });
        
        socket.on('backToPlan', function(emailid) {
          var col = db.collection('moviesWatched:' + emailid.email);
          var id = emailid.id;
          
          col.remove({id : id});
          
          var collectionToWatch = db.collection('moviesToWatch:' + emailid.email);
          
          collectionToWatch.insert({id : id});
          
          socket.emit('listplease');
        });
        
        //function for personal rating for movies watched
        socket.on('rating', function(data) {
            var col = db.collection('moviesWatched:' + data.email);
            var id = data.id;
            var rating = data.rating;
            
            col.remove({id : id}, function(err, res) {
                if(res) {
                    col.insert({id: id, rating: rating}, function(err, res) {
                        if(res) {
                            socket.emit('listplease');
                        }
                    });
                }
            });
        });
    });
  
  // If there is connection with the socket listening on the port
  client.on('connection', function(socket) {    
      var added = false;
      
      // Select the right databases
      var collectionToWatch = db.collection('moviesToWatch:' + email);
      var collectionWatched = db.collection('moviesWatched:' + email);
    
      socket.on('logged', function() {
          if(email != '') { 
              socket.emit('loggedin');
          } else {
              socket.emit('loggedout');
          }
      });
      
      socket.on('checkExistence', function(data) {
          var id = data.id;
          var list = '';
          
          var cursor = collectionToWatch.find({id : id}).toArray(function(err, res) {
            if (res.length > 0) {
                added = true;
                list = 'to-watch';
                socket.emit('existence', added, list);
            } else {
                var cursors = collectionWatched.find({id : id}).toArray(function(err,res) {
                    if (res.length > 0) {
                        added = true;
                        list = 'watched';
                        socket.emit('existence', added, list);
                    } else {
                        socket.emit('existence', added, list);
                    }
                });
            }
          }); 
      });
      
      socket.on('repeat', function() {
          socket.emit('existence', added);
      });
      
      // When lists.js emit addToWatch
      socket.on('addToWatch', function(data) {
      // Find documents in collection with same ID; only inserted if there's no same doc
          var id = data.id;
          var rating = data.rating;
          
          if(rating == '-') {
              collectionToWatch.insert({id: id});
              socket.emit('addedPlan');
          } else {
              collectionWatched.insert({id: id, rating: rating});
              socket.emit('addedWatched');
          }
          
          added = true;
      });

      socket.on('removeToWatch', function(data) {
      // Find documents in collection with same ID; only inserted if there's no same doc
          var id = data.id;
          collectionToWatch.remove({id: id});
          collectionWatched.remove({id: id});
          socket.emit('removed');
          added = false;
      });
  });
});
