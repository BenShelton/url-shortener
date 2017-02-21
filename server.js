// dependencies
const express = require('express');
const mongodb = require('mongodb');

// environment variables
const port = process.env.PORT;
const mongoUrl = process.env.MONGODB_URI;

// server & db setup
const app = express();
const MongoClient = mongodb.MongoClient;

// connect to the server
MongoClient.connect(mongoUrl, (err, db) => {
  // handle error
  if (err) return console.log('Unable to connect to the mongoDB server. Error: ' + err);

  // report successful connection
  console.log('Connection established to mongoDB');
  
  // select collection
  var col = db.collection('urls');
  
  

  // close connection
  db.close();
});

// setup static files
app.use(express.static(__dirname + '/public'));

// routing
app.get('/new/:url(*)', (req, res) => {
  var input = req.params.url;
  // test URL against RegExp
  var re = /^https?:\/\/\w*\.\w*/;
  if (re.test(input)) {
    var output = 'Short';
    res.json({
      result: 'Website Registered',
      short_url: output,
      original_url: input
      });
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