// exports a node http server that isn't listening yet

var path = require('path');

var express = require('express');
var app = express();

var http = require('http');
var server = http.createServer(app);

var pathToPublic = path.join(__dirname, '..', 'public');
app.use(express.static(pathToPublic));

module.exports = server;