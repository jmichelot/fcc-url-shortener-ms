var url = require('url');
var express = require('express');
var morgan = require('morgan'); // logger
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

  // middleware logger
  app.use(morgan('short'));

  var shortener = express.Router();
  app.use('/new', shortener);

  shortener.get('*', function(req, res) {
    var originalUrl = url.parse(req.params[0].slice(1)).href;
    var protocol = url.parse(req.params[0].slice(1)).protocol;
    var doc = { 
      'originalUrl': originalUrl, 
      'shortUrl': req.protocol + '//' + req.hostname + '/' 
    };
    var counter = 1;

    if (protocol != 'http:' && protocol != 'https:') {
      res.json({'error': 'Invalid URL'});
    }
    else {
      db.listCollections({name:'shortUrls'})
        .toArray(function(err, collections) {
          if (collections === undefined) {
            // shortUrls doesn't exist, needs to be created
            db.createCollection('shortUrls', function (err, collection) {
              if (err) throw new Error('createCollection failed.');
              doc.shortUrl += '1';
              collection.insert(doc);
              delete doc._id;
              res.json(doc);
            });
          }
          else {
            // shortUrls exists, we need to find the max number for short urls
            var collection = db.collection('shortUrls');
            collection.find()
              .count(function (err, count) {
                if (count) doc.shortUrl += count+1;
                collection.insert(doc);
                delete doc._id;
                res.json(doc);
            });
          }
      });   
    }
  });


  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  app.get('/:id', function(req, res) {
    var shortUrl = req.protocol + '//' + req.hostname + '/'+ req.params.id;
    db.collection('shortUrls')
      .find({ 'shortUrl': { $eq: shortUrl } }, { _id: 0 })
      .toArray(function(err, elements) {
        if (err) throw err;
        var originalUrl = (elements.length) ? elements[0].originalUrl : null;
        if (originalUrl) res.redirect(originalUrl);
        else { 
          res.status(404); 
          res.end(); 
        }
    });
  });

  app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...');
  });
  
});
