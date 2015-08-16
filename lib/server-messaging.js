/*

This handles

- messages sent by server
- messages recieved by server

*/

var faye = require('faye');
var EventEmitter = require('events').EventEmitter;

module.exports = create;

// param: a node http server
function create(httpServer) {
  return new ServerMessaging(httpServer);
}

function ServerMessaging(httpServer) {
  EventEmitter.call(this);

  var bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
  });
  bayeux.attach(httpServer);

  this.fayeMessages = bayeux.getClient();

  this.fayeMessages.subscribe('/server/ping', function() {
    this.emit('client-ready');
  }.bind(this));

  this.fayeMessages.subscribe('/server/patterns', function(patterns) {
    if (typeof patterns == 'string') {
      patterns = [patterns];
    }

    this.emit('patterns', patterns);
  }.bind(this));
}

var p = ServerMessaging.prototype = Object.create(EventEmitter.prototype);

p.allFiles = function allFiles(files) {
  this.fayeMessages.publish('/client/all-files', files);
};

p.selectedFiles = function selectedFiles(files) {
  this.fayeMessages.publish('/client/selected-files', files);
};