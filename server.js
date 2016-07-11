var express = require('express');
var app = express();
var mongo = require('mongodb');
var config;
try { config = require('./config.js'); }
catch (err) { console.log('config.js not found.'); }
var mongoUrl = process.env.MONGODB_URI || config.mongoUri;
var port = process.env.PORT || 3000;

mongo.connect(mongoUrl, function (err, db) {
  if (err) throw new Error('Database failed to connect!');
  else console.log('Successfully connected to MongoDB.');

  app.get('/', function (req, res) {
    res.send('Hello World');
  });

  app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...');
  });
});
