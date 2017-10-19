'use strict'
const joi = require('joi')
const url = require('url')
const jwt = require('jsonwebtoken')
const { Controller } = require('egg')

module.exports = () => {
  class HomeController extends Controller {
    async index (ctx) {
      ctx.redirect('/public/index.html')
    }

    async user (ctx) {
      ctx.body = ctx.state.user
    }

    async oauth (ctx) {
      const { config } = ctx.service
      const { expiresIn, expiredTime } = config
      const { secret } = ctx.app.config.jsonwebtoken
      const { callbackURL } = ctx.request.query
      let u = await joi.validate(callbackURL, joi.string().uri())
      u = url.parse(u, true)
      u.search = null
      u.query = Object.assign({}, u.query, {
        userId: 'foo',
        userToken: jwt.sign({ id: 'foo' }, secret, { expiresIn }),
        expiresIn,
        expiredTime
      })
      ctx.redirect(url.format(u))
    }

    async callback (ctx) {
      ctx.body = ctx.request.query
    }
  }
  return HomeController
}
