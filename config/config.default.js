'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1508379755713_2546';
  config.jsonwebtoken = {
    secret: 'yet_very_random_secret'
  };
  config.security = {
    csrf: {
      ignoreJSON: true,
    },
  };

  // add your config here
  config.middleware = ['responseFormat'];

  return config;
};
