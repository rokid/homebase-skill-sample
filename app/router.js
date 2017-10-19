'use strict';

module.exports = app => {
  const auth = app.middleware.auth(app.config.jsonwebtoken);
  app.get('/', 'home.index');
  app.get('/user', auth, 'home.user');
  app.get('/oauth/authorize', 'home.oauth');
  app.get('/oauth-callback', 'home.callback');

  app.post('/driver/get', auth, 'driver.get');
  app.post('/driver/list', auth, 'driver.list');
  app.post('/driver/execute', auth, 'driver.execute');
  app.post('/driver/command', 'driver.command');
};
