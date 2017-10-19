'use strict';

module.exports = ({}) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      this.app.emit('error', err, this);
      this.body = {
        status: 1,
        message: err.message,
      };
    }
  };
};
