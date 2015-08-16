// exports a node http server that isn't listening yet

var app = require('express')();

var http = require('http');
var server = http.createServer(app);

app.get('/', function(req, res) {
  // TODO serve client app
  // res.sendFile(__dirname + '/client.html')

  res.send('test');
});

module.exports = server;