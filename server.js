var express = require('express');
var app = express();
var config;

try { config = require('./config.js'); }
catch (err) { console.log('module config not found.'); }

var port = process.env.PORT || config.serverPort;

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(port, function () {
  console.log('Node.js listening on port ' + port + '...');
});
