'use strict';
const joi = require('joi');
const url = require('url');
const jwt = require('jsonwebtoken');

module.exports = app => {
  class HomeController extends app.Controller {
    async index(ctx) {
      ctx.body = 'hi, egg';
    }

    async user(ctx) {
      ctx.body = ctx.state.user;
    }

    async oauth(ctx) {
      const { secret } = ctx.app.config.jsonwebtoken;
      const { callbackURL } = ctx.request.query;
      let u = await joi.validate(callbackURL, joi.string().uri());
      u = url.parse(u);
      u.query = Object.assign({}, u.query, {
        authorization_code: jwt.sign({ username: 'foo' }, secret),
      });
      ctx.redirect(url.format(u));
    }

    async callback(ctx) {
      const { secret } = ctx.app.config.jsonwebtoken;
      const { authorization_code } = ctx.request.query;
      const { username } = jwt.verify(authorization_code, secret);
      ctx.body = {
        userToken: jwt.sign({ id: username }, secret, { expiresIn: '10d' }),
      };
    }
  }
  return HomeController;
};
