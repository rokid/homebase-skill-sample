'use strict'

module.exports = appInfo => {
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1508379755713_2546'
  config.jsonwebtoken = {
    secret: 'yet_very_random_secret'
  }
  config.security = {
    csrf: {
      ignore: [ '/oauth2' ],
      ignoreJSON: true
    }
  }
  config.io = {
    init: {
      transport: [ 'polling', 'websocket' ]
    }, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [],
        packetMiddleware: []
      }
    }
  }

  // add your config here
  config.middleware = [ 'requestLogger', 'errorHandler', 'responseFormat' ]

  config.responseFormat = {
    ignore: [ '/oauth2' ]
  }

  return config
}
