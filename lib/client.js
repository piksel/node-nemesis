var net = require('net');

var clientPrototype = {
  servers: {},
  queue: [],
  timeout: 8000,
  _client: null,
  __init__: function(port, interval, callback){

    interval = interval || 2000;

    _client = net.createServer();

    var client = this;

    _client.listen(port, function() {
      tProc = setInterval(function(){
        for(i in client.queue){
          if(client.queue[i].length<1) continue
          var q = client.queue[i][0]
          if(q.requested) continue;
          if(typeof client.servers[q.address] != 'undefined'){
            q.requested = true;
            client.servers[q.address].write(q.request)
          }
          else {
            console.log('No servers currently connected.')
          }

        }
      }, interval);
      callback(null)
    })

    _client.on('connection', function(server){

      server.origin = server.remoteAddress;

      server.on('data', function(data){
        if(client.queue[server.remoteAddress].length>0) {
          var q = client.queue[server.remoteAddress][0]
          q.response = Buffer.concat([q.response, new Buffer(data,'binary')]);
        }
      })

      server.on('close', function(){
        if(client.queue[server.origin].length>0) {
          var q = client.queue[server.origin].shift()
          clearTimeout(q.timeout)
          q.callback(null, q.response)
        }
        delete client.servers[server.origin];
      })

      var s = {};
      client.servers[server.remoteAddress] = server
      if(typeof client.queue[server.remoteAddress] == 'undefined')
        client.queue[server.remoteAddress] = [];
    })

  },

  send: function(request, address, callback, timeout) {

    if(typeof this.queue[address] == 'undefined')
      this.queue[address] = [];

    var qindex = this.queue[address].push({
      address: address,
      request: request,
      response: new Buffer('', 'binary'),
      callback: callback,
      requested: false,
      timeout: -1,
    })

    var client = this;
    toindex = setTimeout(function(){
      var q = client.queue[address].shift()
      q.callback('Timeout', '')
    }, timeout || this.timeout)

    this.queue[address][qindex-1].timeout = toindex;

  }
}

module.exports = function(port, interval, callback){

  var client = Object.create(clientPrototype);
  client.__init__(port, interval, function(error){
    callback(error, client)
  })


}