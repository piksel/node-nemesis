var nemesis = require('..')

var servers = []

var client = nemesis.createClient(8448)
client.on('connection', function(server){
  console.log('[nemesis][' + server.remoteAddress +  '] Got connection from server!')
  servers.push(server)
})
client.on('close', function(server){
  console.log('[nemesis][' + server.remoteAddress +  '] Server disconnected.')
  //servers.push(server)
})

setInterval(function(){
  if(servers.length<1) return
  for(i in servers){
    servers[i].write('status')
  }

}, 5000);