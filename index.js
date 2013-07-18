/*
  nemesis library
  index.js - main module entry point
  copyright (c) 2013, piksel bitworks
 */

var createServer = require('./lib/server.js')
 ,  createClient = require('./lib/client.js')
 ,  common = require('./lib/common.js')

module.exports = common
module.exports.createServer = createServer
module.exports.createClient = createClient