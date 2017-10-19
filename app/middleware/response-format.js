'use strict';
const _ = require('lodash');

module.exports = ({}) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (err.isJoi) {
        ctx.status = 422;
        ctx.body = err.details;
        return;
      }
      if (err.code) {
        ctx.status = 200;
        ctx.body = {
          status: 1,
          message: err.message,
          errorName: err.code,
        };
        return;
      }
      throw err;
    }
    if (ctx.body) {
      const data = ctx.body;
      ctx.body = {
        status: 0,
        data,
      };
    }
  }
}
