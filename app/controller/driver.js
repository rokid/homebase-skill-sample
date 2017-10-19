'use strict'
const joi = require('joi')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const url = require('url')
const { Controller } = require('egg')
const Device = require('../model/devices')

const List = joi.object({
  userAuth: joi.object()
})
const Get = joi.object({
  device: joi.object({
    deviceId: joi.string(),
    userAuth: joi.object()
  })
})
const Execute = joi.object({
  device: joi.object({
    deviceId: joi.string(),
    deviceInfo: joi.object(),
    state: joi.object(),
    userAuth: joi.object()
  }),
  action: joi.object({
    property: joi.string(),
    name: joi.string(),
    value: joi.number().optional()
  })
})
const Command = joi.object({
  command: joi.string().allow('OAuth', 'OAuthRefresh', 'Login'),
  params: joi.object()
})
Command.OAuth = joi.object({
  callbackURL: joi.string().uri()
})
Command.OAuthRefresh = joi.object({
  userId: joi.string(),
  userToken: joi.string(),
  expiredTime: joi.any(),
  expiresIn: joi.any()
})
Command.Login = joi.object({
  username: joi.string(),
  password: joi.string()
})

module.exports = () => {
  const valueSetter = key => (device, name) => {
    device.state[key] = name
  }
  const numSetter = (key, min, max) => (device, name, value) => {
    switch (name) {
      case 'random':
        device.state[key] = _.random(min, max)
        break
      case 'next':
      case 'up':
        device.state[key] = device.state[key] + (value || 1)
        break
      case 'prev':
      case 'down':
        device.state[key] = device.state[key] - (value || 1)
        break
      case 'max':
        device.state[key] = max
        break
      case 'min':
        device.state[key] = min
        break
      case 'num':
        device.state[key] = value
        break
      default:
        break
    }
  }
  const executor = {
    switch: valueSetter('switch'),
    color: numSetter('color', 0x000000, 0xffffff),
    brightness: numSetter('brightness', 0, 100),
    mode: valueSetter('mode'),
    swing_mode: valueSetter('swing_mode'),
    fanspeed: numSetter('fanspeed', 0, 100),
    humidity: numSetter('humidity', 0, 100),
    temperature: numSetter('temperature', 0, 100),
    volume: numSetter('volume', 0, 100),
    channel: numSetter('channel', 0, 100),
    color_temperature: numSetter('color_temperature', 0, 100)
  }

  class DriverController extends Controller {
    async get (ctx) {
      const body = await joi.validate(ctx.request.body, Get, { stripUnknown: true })
      const { deviceId } = body.device
      const device = Device.find(deviceId)
      if (_.isNil(device)) {
        const err = new Error()
        err.code = 'E_DRIVER_DEVICE_NO_FOUND'
        throw err
      }
      ctx.body = device
    }

    async list (ctx) {
      await joi.validate(ctx.request.body, List, { stripUnknown: true })
      ctx.body = Device.data
    }

    async execute (ctx) {
      const body = await joi.validate(ctx.request.body, Execute, { stripUnknown: true })
      const { device: { deviceId, deviceInfo }, action: { property, name, value } } = body
      const device = Device.find(deviceId)
      if (_.isNil(device)) {
        const err = new Error()
        err.code = 'E_DRIVER_DEVICE_NO_FOUND'
        throw err
      }
      if (!_.includes(Object.getOwnPropertyNames(device.actions), property)) {
        const err = new Error('Not supported action on device')
        err.code = 'E_DRIVER_ERROR'
        throw err
      }
      if (!_.isEqual(deviceInfo, device.deviceInfo)) {
        const err = new Error('DeviceInfo not aligned')
        err.code = 'E_DRIVER_ERROR'
        throw err
      }
      executor[property](device, name, value)
      ctx.body = device.state
      ctx.app.io.emit('execute', { device })
    }

    async command (ctx) {
      const body = await joi.validate(ctx.request.body, Command, { stripUnknown: true })
      const params = await joi.validate(body.params, Command[body.command], { stripUnknown: true })
      return this[`command${body.command}`](ctx, params)
    }

    async commandOAuth (ctx, params) {
      const origin = ctx.request.origin
      const u = url.parse(origin)
      u.pathname = '/oauth/authorize'
      u.query = params
      ctx.body = url.format(u)
    }

    async commandOAuthRefresh (ctx, params) {
      const { config } = ctx.service
      const { expiresIn, expiredTime } = config
      const { secret } = ctx.app.config.jsonwebtoken
      let user
      try {
        user = jwt.verify(params.userToken, secret)
      } catch (err) {
        err.code = 'E_DRIVER_SIGN_ERROR'
        throw err
      }
      ctx.body = Object.assign({
        expiresIn,
        expiredTime
      }, params, {
        userToken: jwt.sign(_.omit(user, 'iat', 'exp'), secret, { expiresIn })
      })
    }

    async commandLogin (ctx, params) {
      const { config } = ctx.service
      const { expiresIn, expiredTime } = config
      const { secret } = ctx.app.config.jsonwebtoken
      const user = {
        id: params.username
      }
      ctx.body = {
        userId: params.username,
        userToken: jwt.sign(user, secret, { expiresIn }),
        expiresIn,
        expiredTime
      }
    }
  }
  return DriverController
}
