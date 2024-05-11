const constants = require('./constants');

module.exports = {
  duration: '3d',
  type: 'buffer',
  fetchOptions: {
    headers: {
      'user-agent': constants.requestUserAgent,
    },
  },
};
