var net = require('net');

var serverPrototype = {
  _server: null,
  port: '',
  host: '',
  datacb: function(){},
  closing: false,
  close: function(){
    this.closing = true;
    this._server.end();
  },
  connect: function(callback){
    var server = this
    try {
      this._server = net.connect({port:server.port, host:server.host}, function(){

        server._server.on('close', function(){
          if(!server.closing)
          server.connect(function(){ })
        })

        this.on('data', server.datacb)

        callback(null, server._server)

      })
    }
    catch (e) {
      callback(e, null)
    }
  },
  __init__: function(port, host, callback){
    this.port = port
    this.host = host
    this.connect(callback)
  },
  end: function(data) {
    this._server.end(data)
  },
  on: function(event, callback){
    // only data is supported for now
    if(event != 'data') return;

    this.datacb = callback;
    this._server.on('data', callback)

  }
}

module.exports = function(port, host, callback){

  var server = Object.create(serverPrototype)
  server.__init__(port, host, function(){
    callback(null, server)
  });

}