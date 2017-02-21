// dependencies
const express = require('express');
const mongodb = require('mongodb');

// environment variables
const port = process.env.PORT;
const mongoUrl = process.env.MONGODB_URI;

// server & db setup
const app = express();
var col, lastRef;

// connect to the server
mongodb.MongoClient.connect(mongoUrl, (err, db) => {
  // handle error
  if (err) return console.log('Unable to connect to the mongoDB server. Error: ' + err);

  // report successful connection
  console.log('Connection established to mongoDB');
  
  // select collection
  col = db.collection('urls');
  
  // find last used ref
  col.find().sort({ref: -1}).toArray((err, doc) => {
    if (err) return console.log(err);
    lastRef = doc[0] ? doc[0].ref : 0;
  });
  
});

// setup static files
app.use(express.static(__dirname + '/public'));

// routing
// url expansion
app.get('/:ref', (req, res) => {
  // search db for reference
  var search = {ref: Number(req.params.ref)};
  col.find(search).toArray((err, data) => {
    // if err or data not found return JSON error
    if (err || !data[0]) {
      res.json({error: 'Invalid Shortened URL'});
    // if data found, redirect
    } else {
      res.redirect(data[0].fullUrl);
    }
  });
});

// add new url
app.get('/new/:url(*)', (req, res) => {
  var input = req.params.url;
  // test URL against RegExp
  var re = /^https?:\/\/\w*\.\w*/;
  if (re.test(input)) {
    // create doc to add
    var data = {
      fullUrl: input,
      ref: ++lastRef
    };
    // add doc
    col.insert(data, (err, doc) => {
      // if error return JSON error
      if (err) {
        console.log(err);
        res.json({
          result: 'Website Not Registered',
          error: 'Database Error',
          original_url: input
        }); 
      // if doc added return JSON URLs
      } else {
        res.json({
          result: 'Website Registered',
          short_url: 'https://frozen-dusk-72112.herokuapp.com/' + doc.ops[0].ref,
          original_url: input
        });
      }
    });
  // if invalid URL entered return JSON error
  } else {
    res.json({
      result: 'Website Not Registered',
      error: 'Invalid URL',
      original_url: input
    });
  }
});

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// start server
app.listen(port, () => console.log('Listening on port ' + port));