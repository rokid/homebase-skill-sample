'use strict'

module.exports = app => {
  const config = {
    expiresIn: 20 * 60,
    throws: false,
    clients: [
      {
        id: 'very_random_client',
        secret: 'very_random_secret',
        redirect_uri: 'http://www.example.com'
      }
    ]
  }

  class ConfigService extends app.Service {
    get expiresIn () {
      return config.expiresIn
    }

    get expiredTime () {
      return Date.now() + config.expiresIn * 1000
    }

    get throws () {
      return Boolean(config.throws)
    }

    get clients () {
      return config.clients
    }

    set (conf) {
      Object.assign(config, conf)
    }

    get all () {
      return config
    }
  }

  return ConfigService
}
