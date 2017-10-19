'use strict'

module.exports = () => {
  return async (ctx, next) => {
    if (ctx.request.body) {
      ctx.logger.info('with param:\n%o\nwith headers:\n%o', ctx.request.body, ctx.request.headers)
    } else {
      ctx.logger.info('with headers:\n%o', ctx.request.headers)
    }
    await next()
    ctx.logger.info('Response status: %d', ctx.status)
  }
}
