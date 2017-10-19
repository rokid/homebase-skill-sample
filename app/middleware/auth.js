'use strict'
const jwt = require('jsonwebtoken')
const joi = require('joi')

const UserAuth = joi.object({
  userId: joi.string(),
  userToken: joi.string()
})

module.exports = ({ secret }) => {
  return async (ctx, next) => {
    const { config } = ctx.service

    if (config.throws) {
      const error = new Error('Intended error')
      error.code = 'E_DRIVER_ERROR'
      throw error
    }

    const body = ctx.request.body
    let userAuth = body.userAuth != null ? body.userAuth
      : body.device && body.device.userAuth
    userAuth = await joi.validate(userAuth, UserAuth, { stripUnknown: true })
    try {
      const user = jwt.verify(userAuth.userToken, secret)
      ctx.state.user = user
    } catch (err) {
      err.code = 'E_DRIVER_SIGN_ERROR'
      throw err
    }
    return next()
  }
}
