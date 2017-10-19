'use strict'
/* eslint-disable camelcase */

const joi = require('joi')
const boom = require('boom')
const _ = require('lodash')
const { URL } = require('url')
const jwt = require('jsonwebtoken')
const basicauth = require('basic-auth')
const { Controller } = require('egg')

const AuthorizeQuerySchema = joi.object({
  response_type: joi.string().allow('code').required(),
  client_id: joi.string().required(),
  redirect_uri: joi.string().uri(),
  scope: joi.string(),
  state: joi.string()
})

const TokenBodySchema = joi.object({
  grant_type: joi.string().allow('refresh_token', 'authorization_code').required(),
  client_id: joi.string(),
  client_secret: joi.string(),
  redirect_uri: joi.string().uri(),
  code: joi.string(),
  refresh_token: joi.string()
})

class OAuthController extends Controller {
  getClient (client_id) {
    const { ctx } = this
    const { config } = ctx.service
    return _.find(config.clients, { id: client_id })
  }

  async authorize () {
    const { ctx } = this
    const { config } = ctx.service
    const { expiresIn } = config
    const { secret } = ctx.app.config.jsonwebtoken

    const query = await joi.validate(ctx.request.query, AuthorizeQuerySchema)
    const { client_id, redirect_uri, state, scope } = query

    const client = this.getClient(client_id)
    if (client == null) {
      throw boom.unauthorized('client doesn\'t exists')
    }
    const callbackUri = _.defaultTo(redirect_uri, client.redirect_uri)
    const uri = new URL(redirect_uri || client.redirect_uri)
    _.forEach({
      code: jwt.sign({
        type: 'authorization_code',
        id: 'foo',
        scope,
        redirect_uri: callbackUri
      }, secret, { expiresIn }),
      state
    }, (val, key) => {
      uri.searchParams.set(key, val)
    })
    ctx.redirect(uri.toString())
  }

  async token () {
    const { ctx } = this
    const { config } = ctx.service
    const { expiresIn } = config
    const { secret } = ctx.app.config.jsonwebtoken
    const body = await joi.validate(ctx.request.body, TokenBodySchema)
    const { grant_type, redirect_uri, code, refresh_token } = body
    let { client_id, client_secret } = body

    if (client_id == null || client_secret == null) {
      const auth = basicauth(ctx)
      client_id = auth.name
      client_secret = auth.pass
    }
    if (_.get(this.getClient(client_id), 'secret') !== client_secret) {
      throw boom.unauthorized('client not authorized')
    }

    const user = {}
    const handler = {
      authorization_code: async () => {
        let aCode
        try {
          aCode = jwt.verify(code, secret)
        } catch (err) {
          console.error(err)
          throw boom.unauthorized('authorization_code is unauthorized')
        }
        if (aCode.redirect_uri !== redirect_uri) {
          throw boom.badRequest('redirect_uri is not aligned with authorization_code')
        }
        if (aCode.type !== 'authorization_code') {
          throw boom.unauthorized('authorization_code is not valid')
        }
        Object.assign(user, _.pick(aCode, 'id', 'scope'))
      },
      refresh_token: async () => {
        let refreshToken
        try {
          refreshToken = jwt.verify(refresh_token, secret)
        } catch (err) {
          throw boom.unauthorized('refresh_token is unauthorized')
        }
        if (refreshToken.type !== 'refresh_token') {
          throw boom.unauthorized('authorization_code is not valid')
        }
        Object.assign(user, _.pick(refreshToken, 'id', 'scope'))
      }
    }[grant_type]
    if (handler) {
      await handler()
    } else {
      throw boom.badRequest('grant_type not supported')
    }

    ctx.body = {
      expires_in: expiresIn,
      access_token: jwt.sign(Object.assign({ id: 'foo' }, user, { type: 'access_token' }), secret, { expiresIn }),
      refresh_token: jwt.sign(Object.assign({ id: 'foo' }, user, { type: 'refresh_token' }), secret, { expiresIn: expiresIn * 10 })
    }
  }
}

module.exports = OAuthController
