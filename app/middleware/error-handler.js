'use strict'

const _ = require('lodash')

module.exports = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      if (err.isBoom) {
        ctx.status = err.output.statusCode
        ctx.body = err.output.payload
        return
      } else if (err.isJoi) {
        const { details } = err
        this.status = 422
        this.body = {
          status: 1,
          error: {
            name: 'Unprocessable Entity',
            message: err.message,
            meta: details.map(it => _.pick(it, 'message', 'path'))
          },
          erroeName: err.code
        }
      } else {
        ctx.app.emit('error', err, ctx)
      }
      ctx.body = {
        status: 1,
        message: err.message,
        errorName: err.code
      }
    }
  }
}
