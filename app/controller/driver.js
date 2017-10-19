'use strict';
const joi = require('joi');
const Chance = require('chance');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const url = require('url');

const chance = new Chance();
const devices = _.times(10, idx => ({
  type: 'light',
  deviceId: String(idx),
  name: chance.name(),
  actions: {
    switch: ['on', 'off']
  },
  state: {
    switch: 'off'
  }
}));

const List = joi.object({
  userAuth: joi.object(),
});
const Get = joi.object({
  device: joi.object({
    deviceId: joi.string(),
    userAuth: joi.object(),
  }),
});
const Execute = joi.object({
  device: joi.object({
    deviceId: joi.string(),
    state: joi.object(),
    userAuth: joi.object(),
  }),
  action: joi.object({
    property: joi.string(),
    name: joi.string(),
    value: joi.number().optional(),
  }),
});
const Command = joi.object({
  command: joi.string().allow('OAuth', 'OAuthRefresh', 'Login'),
  params: joi.object(),
});
const CommandOAuth = joi.object({
  callbackURL: joi.string().uri(),
});
const CommandOAuthRefresh = joi.object({
  userId: joi.string(),
  userToken: joi.string(),
});
const CommandLogin = joi.object({
  username: joi.string(),
  password: joi.string(),
});

module.exports = app => {
  const executor = {
    switch (device, name) {
      device.state.switch = name;
    },
  };

  class DriverController extends app.Controller {
    async get(ctx) {
      const body = await joi.validate(ctx.request.body, Get);
      const { deviceId } = body.device;
      const device = _.find(devices, { deviceId });
      if (_.isNil(device)) {
        const err = new Error();
        err.code = 'E_DRIVER_DEVICE_NO_FOUND';
        throw err;
      }
      ctx.body = device;
    }

    async list(ctx) {
      const body = await joi.validate(ctx.request.body, List);
      ctx.body = devices;
    }

    async execute(ctx) {
      const body = await joi.validate(ctx.request.body, Execute);
      const { device: { deviceId }, action: { property, name, value } } = body;
      const device = _.find(devices, { deviceId });
      if (_.isNil(device)) {
        const err = new Error();
        err.code = 'E_DRIVER_DEVICE_NO_FOUND';
        throw err;
      }
      if (!_.includes(Object.getOwnPropertyNames(device.actions), property)) {
        const err = new Error('Not supported action on device');
        err.code = 'E_DRIVER_ERROR';
        throw err;
      }
      executor[property](device, name, value);
      ctx.body = device.state;
    }

    async command(ctx) {
      const body = await joi.validate(ctx.request.body, Command);
      return this[`command${body.command}`](ctx, body.params);
    }

    async commandOAuth(ctx, params) {
      const origin = ctx.request.origin;
      const u = url.parse(origin);
      u.pathname = '/oauth';
      u.query = params;
      ctx.body = url.format(u);
    }

    async commandOAuthRefresh(ctx, params) {
      const { secret } = ctx.app.config.jsonwebtoken;
      let user;
      try {
        user = jwt.verify(params.userToken, secret);
      } catch (err) {
        err.code = 'E_DRIVER_SIGN_ERROR';
        throw err;
      }
      ctx.body = Object.assign({}, params, {
        userToken: jwt.sign(_.omit(user, 'exp'), secret, { expiresIn: '7d' }),
      });
    }

    async commandLogin(ctx, params) {
      const { secret } = ctx.app.config.jsonwebtoken;
      const user = {
        id: params.username,
      };
      ctx.body = {
        userId: params.username,
        userToken: jwt.sign(user, secret, { expiresIn: '7d' }),
      };
    }
  }
  return DriverController;
};
