'use strict'

module.exports = app => {
  const { controller } = app
  const auth = app.middleware.auth(app.config.jsonwebtoken)
  app.get('/', 'home.index')
  app.get('/user', auth, 'home.user')

  app.get('/config', 'config.get')
  app.put('/config', 'config.set')

  app.get('/oauth/authorize', 'home.oauth')
  app.get('/oauth-callback', 'home.callback')

  app.get('/oauth2/authorize', 'oauth.authorize')
  app.post('/oauth2/token', 'oauth.token')

  app.post('/driver/get', auth, 'driver.get')
  app.post('/driver/list', auth, 'driver.list')
  app.post('/driver/execute', auth, 'driver.execute')
  app.post('/driver/command', 'driver.command')

  app.resources('devices', '/api/devices', controller.device)
  app.put('/api/devices/reset', 'device.reset')
  app.put('/api/devices/reset-state', 'device.resetState')
}
