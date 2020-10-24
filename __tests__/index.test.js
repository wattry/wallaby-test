const axios = require('axios');
const jwt = require('jsonwebtoken');
const { handler } = require('../');
const { EVENT, POLICY_SUCCESS } = require('../__data__');

jest.mock('jsonwebtoken');
jest.mock('aws-sdk');
jest.mock('lambda-warmer');
jest.mock('axios');

const mockBuild = jest.fn();

describe('handler', () => {
  beforeEach(() => {
    process.env.STACK_ID = 12345;
    process.env.CLIENT_ID = 12345;
    process.env.CLIENT_SECRET = 12345;
    process.env.AWS_REGION = "us-east"
  })
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('it throws an error when authorizer fails', () => {
    expect(() => handler({}))
      .rejects
      .toThrowError('Event object not passed to handler.')
  });

  test('it throws an error when authorizer fails', async () => {
    axios.post.mockReturnValue({ data: { access_token: 'ey12345.token', id_token: 'ey12345.token', refresh_token: 'ey12345.token' } });
    jwt.decode.mockReturnValue({ payload: { uid: 'uid', name: 'name', email: 'email@vt.edu' } });

    mockBuild.mockReturnValueOnce({
      principalId: 'principalId',
      policyDocument: POLICY_SUCCESS.policyDocument
    });

    await expect(handler(EVENT))
      .resolves
      .toEqual(POLICY_SUCCESS)
  });
});

jest.mock('uuid', () => ({
  v4: () => '0987654321'
}));

jest.mock('/opt/nodejs/utils/AuthPolicy', () => {
  return function () {
    return ({
      denyAllMethods: jest.fn(),
      build: mockBuild,
      allowMethod: jest.fn()
    })
  }
}, {
  virtual: true
});

jest.mock('/opt/nodejs/utils/helper', () => {
  const { portalRolePermissions } = require('../__data__');

  return {
    lookupParams: () => portalRolePermissions
  }
}, {
  virtual: true
});

// https://git-codecommit.us-east-1.amazonaws.com/v1/repos/customer-portal