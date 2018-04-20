var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var mongolabURL = 'mongodb://Client:Client@ds037195.mongolab.com:37195/chat';
var client = require('socket.io').listen(8080).sockets;
var app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(stormpath.init(app, {
     web: {
    register: {
      enabled: true,
      uri: '/register',
      nextUri:'/',
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
  }
}));

var email = '';

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Welcome'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/results', function(req, res) {
  res.render('results', {
    title: 'Results'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/title', function(req, res) {
  res.render('title', {
    title: 'Movie'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/about', function(req, res) {
  res.render('about', {
    title: 'About'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/userpage', function(req, res) {
  res.render('userpage', {
    title: 'Profile'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/contact-us', function(req, res) {
  res.render('contact-us', {
    title: 'Contact'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.get('/list', function(req, res) {
  res.render('list', {
    title: 'Lists'
  });
  if(req.user != undefined) {
    email = req.user.email;
  }
});

app.use('/profile',stormpath.loginRequired,require('./profile')());
app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
  app.listen(3000);
});

// Connection with the mongo database is mode with key and username + password
mongo.connect(mongolabURL, function(error, db) {
  assert.equal(null, error);
  
  // If there is connection with the socket listening on the port
  client.on('connection', function(socket) {
    
      var added = false;
      
      // Select the right databases
      var collectionToWatch = db.collection('moviesToWatch:' + email);
      
      socket.on('checkExistence', function(data) {
          var id = data.id;
          
          var cursor = collectionToWatch.find({id : id}).toArray(function(err, res) {
            if (err) {
                added = undefined;
            }
            if (res.length > 0) {
                added = true;
            } 
            socket.emit('existence', added);
          });  
      });
      
      socket.on('repeat', function() {
          socket.emit('existece', added);
      });
      
      
      // When lists.js emit addToWatch
      socket.on('addToWatch', function(data) {
      // Find documents in collection with same ID; only inserted if there's no same doc
          var id = data.id;
          collectionToWatch.insert({id: id});
          console.log("added!");
          socket.emit("added");
          added = true;
          socket.emit("existence", added);
      });

      socket.on('removeToWatch', function(data) {
      // Find documents in collection with same ID; only inserted if there's no same doc
          var id = data.id;
          collectionToWatch.remove({id: id});
          socket.emit("removed");
          added = false;
          socket.emit("existence", added);
      });
  });
});
