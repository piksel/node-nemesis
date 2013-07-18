var nemesis = require('..')

var server = nemesis.createServer(8448, 'localhost')

server.on('data', function(data) {
  var req = data.toString();
  var res = 'unknown command'
  console.log(' > ' + req);
  if(req == 'status'){
    res = 'ok'
  }
  console.log(' < ' + res)
  server.write(res)
});
server.on('end', function() {
  console.log('Client disconnected');
});