const { edUserInfo } = require('../__data__');

class Lambda {
  invoke = jest.fn()
    .mockImplementation(() => ({
      promise: () => Promise.resolve({ Payload: JSON.stringify(edUserInfo) })
    }));
};

module.exports = {
  Lambda
};