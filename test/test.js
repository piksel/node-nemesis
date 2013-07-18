var assert = require('assert')

var nemesis = require('..')

var perform_extended_tests = false;
var extended_timeout = 6*60*60*1000; // six hour tests (!)
var extended_delay = extended_timeout - (5 * 60 * 1000); // five minutes before timeout

describe('Nemesis', function(){
  
  var client, server;

  describe('client initialization', function(){
    it('should initialize the client without error', function(done){
      // init the client with only 100ms processing interval to decrease testing delay
      nemesis.createClient(8448, 100, function(error, instance){
        assert.equal(error, null, 'Returned error!');
        client = instance;
        done()
      })
    })
  })

  describe('echo transmission', function(){
    it('should transmit a string and recive the same string back', function(done){

      this.timeout(4000)

      nemesis.createServer(8448, '127.0.0.1', function(error, server){

        server.on('data', function(data) {
          server.end(data.toString())
        });

        // send test string
        client.send('OK', '127.0.0.1', function(err, res){
          assert.equal(res, 'OK', 'Invalid response!');
          assert.equal(err, null, 'Returned error!');
          server.close()
          done()
        })

      })

    })
  })

  describe('binary transmission', function(){
    it('should transmit a command and recive a binary data stream back', function(done){

      this.timeout(4000)

      nemesis.createServer(8448, '127.0.0.1', function(error, server){

        var binary = new Buffer(1024*1024*10)
        for(var i=0; i < binary.length; i++){
          binary[i] = Math.floor(Math.random()*255)
        }

        server.on('data', function(data) {
          server.end(binary)
        });

        // send test string
        client.send('Get binary data', '127.0.0.1', function(err, res){
          assert.equal(res.toString(), binary.toString(), 'Bytes sent and bytes recieved differ!');
          assert.equal(err, null, 'Returned error!');
          server.close()
          done()
        })
      })
    })
  })

  describe('multi-part transmission', function(){
    it('should transmit a series of commands and recive the responses in the right order', function(done){
      this.timeout(4000)

      var responses = ['a','b','c']

      nemesis.createServer(8448, '127.0.0.1', function(error, server){

        var parts = 0;
        var partdone = function(){
          parts++;
          if(parts >= responses.length) done();
        }

        server.on('data', function(data) {
          var res = responses[parseInt(data)]
          server.end(res)
        });

        for(var i=0; i<responses.length; i++){
          (function(r){
            client.send((''+i), '127.0.0.1', function(err, res){
              assert.equal(res, r, 'Invalid response!');
              assert.equal(err, null, 'Returned error!');
              partdone()
            })
          })(responses[i])
        }

      })
    })
  })

  /* TODO: Tests for encoding handling */

  describe('timeout', function(){
    it('should return timeout error when contacting server', function(done){

      this.timeout(10000)

      nemesis.createServer(8448, '127.0.0.1', function(error, server){

        server.on('data', function(data) {
          return
        });

        // send test string
        client.send('Do not respond', '127.0.0.1', function(err, res){
          assert.equal(res, '', 'Should return empty string on error!');
          assert.equal(err, 'Timeout', 'Did not raise Timeout error!');
          server.close()
          done()
        })
      })
    })
  })

  if(perform_extended_tests) {



    describe('long poll (extended)', function(){
      it('should return even with a really large delay', function(done){

        this.timeout(extended_timeout); 

        nemesis.createServer(8448, '127.0.0.1', function(error, server){

          server.on('data', function(data) {
            console.log('Got data:' + data);
            server.end('OK')
          });

          setTimeout(function(){
            // send test string
            client.send((''+new Date()), '127.0.0.1', function(err, res){
              assert.equal(res, 'OK', 'Should return OK');
              assert.equal(err, null, 'Should not raise a error');
              server.close()
              done()
            })
          }, extended_delay);

        })
      })
    })
/*
    describe('timeout (extended)', function(){
      it('should return timeout error when contacting server', function(done){

        var extended_time = 1*60*60*1000; // six hour test (!)

        this.timeout(extended_time); 

        nemesis.createServer(8448, '127.0.0.1', function(error, server){

          server.on('data', function(data) {
            console.log('Got data:' + data);
            var res = new Date();
            server.end(res)
          });

          setTimeout(function(){
            // send test string
            client.send((''+new Date()), '127.0.0.1', function(err, res){
              assert.equal(res, '', 'Should return empty string on error!');
              assert.equal(err, 'Timeout', 'Did not raise Timeout error!');
              server.close()
              done()
            })
          }, extended_time - 30 * 60 * 1000);

        })
      })
    })
*/
  }
  else {
    console.log('skipping extended tests.');
  }
})