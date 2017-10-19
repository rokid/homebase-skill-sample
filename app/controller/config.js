'use strict'

const joi = require('joi')

const Control = {
  expiresIn: joi.number().positive().integer(),
  throws: joi.bool()
}

module.exports = app => {
  class ConfigController extends app.Controller {
    async get (ctx) {
      const { config } = ctx.service
      ctx.body = config.all
    }

    async set (ctx) {
      const body = await joi.validate(ctx.request.body, Control, { stripUnknown: true })
      const { config } = ctx.service
      config.set(body)
      ctx.body = config.all
    }
  }

  return ConfigController
}
