const axios = require('axios');
const jwt = require('jsonwebtoken');

const authorizer = require('../authorizer');
const {
  portalRolePermissions,
  POLICY_SUCCESS,
} = require('../__data__');
const utils = require('../utils');
const mockBuild = jest.fn()

jest.mock('aws-sdk');
jest.mock('jsonwebtoken');
jest.mock('axios');

describe('authorizer', () => {
  let helper = null;
  beforeEach(() => {
    helper = require('/opt/nodejs/utils/helper');

    helper.setPortalRolePermissions(portalRolePermissions);
  })
  afterEach(() => {
    jest.clearAllMocks();
    process.env = {}
  })

  test('it should return unauthenticated if event the does not have headers', () => {
    expect(authorizer())
      .rejects
      .toThrow("Cannot read property 'headers' of undefined");
  });

  test('it should return unauthenticated if event the does not have headers', () => {
    expect(authorizer({}))
      .rejects
      .toThrow("Expected valid CloudFront custom header");
  });

  test('it should return unauthenticated if event headers are empty', () => {
    expect(authorizer({ headers: {}}))
      .rejects
      .toThrow("Expected valid CloudFront custom header");
  });

  test('it should return unauthenticated if StackId is valid but env STACK_ID not set', () => {
    expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrow("Expected valid CloudFront custom header");
  });

  test('it should return unauthenticated portalRolePermissions are not set.', async () => {
    process.env.STACK_ID = 12345;
    helper.setPortalRolePermissions(null);

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
      .mockImplementation(() => false)

    await expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrowError("portalRolePermissions and authorization code must be defined.");
    
    expect(utilsSpy).toHaveBeenCalled();
  });

  test('it should return unauthenticated portalRolePermissions are empty.', async () => {
    process.env.STACK_ID = 12345;
    helper.setPortalRolePermissions({});

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
      .mockImplementation(() => false)

    await expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrow("portalRolePermissions and authorization code must be defined.");
    expect(utilsSpy).toHaveBeenCalled();
  });

  test('it should return unauthenticated portalRolePermissions ROLES not set.', async () => {
    process.env.STACK_ID = 12345;
    helper.setPortalRolePermissions({ CUSTOMER_PORTAL_APPS: "TEST_APPS" });

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
      .mockImplementation(() => false)

    await expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrowError("portalRolePermissions and authorization code must be defined.");
    expect(utilsSpy).toHaveBeenCalled();
  });

  test('it should return unauthenticated code not set.', async () => {
    process.env.STACK_ID = 12345;
    helper.setPortalRolePermissions({ CUSTOMER_PORTAL_APPS: "TEST_APPS", ROLES: "TEST_ROLES" });

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
      .mockImplementation(() => false);

    await expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrow("portalRolePermissions and authorization code must be defined.");
    expect(utilsSpy).toHaveBeenCalled();
  });

  test('it should return unauthenticated CLIENT_ID not set', async () => {
    process.env.STACK_ID = 12345;
    helper.setPortalRolePermissions({ CUSTOMER_PORTAL_APPS: "TEST_APPS", ROLES: "TEST_ROLES" });

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
      .mockImplementation(() => "1234567890" );

    await expect(authorizer({ headers: { StackId: '12345' } }))
      .rejects
      .toThrowError("client id and secret must be set");
    expect(utilsSpy).toHaveBeenCalled();
  });

  test('it should return unauthenticated CLIENT_ID not set', async () => {
    process.env.STACK_ID = 12345;
    process.env.CLIENT_ID = "12345";
    helper.setPortalRolePermissions({ CUSTOMER_PORTAL_APPS: "TEST_APPS", ROLES: "TEST_ROLES" });

    const utilsSpy = jest.spyOn(utils, 'getAuthorizationCode')
    .mockImplementation(() => "1234567890");
    await expect(authorizer({ headers: { StackId: '12345' } }))
    .rejects
    .toThrow("client id and secret must be set");
    expect(utilsSpy).toHaveBeenCalled();
  });

  describe('axios token requests', () => {
    beforeEach(() => {
      process.env.STACK_ID = 12345;
      process.env.CLIENT_ID = "12345";
      process.env.CLIENT_SECRET = "54321";
      helper.setPortalRolePermissions({ CUSTOMER_PORTAL_APPS: "TEST_APPS", ROLES: "TEST_ROLES" });

      jest.spyOn(utils, 'getAuthorizationCode')
        .mockImplementation(() => "1234567890");
    });

    const event = { headers: { StackId: '12345' } }

    test('it should return unauthenticated when gateway does not return data.', async () => {
      axios.post.mockReturnValue({ data: {} });
      await expect(authorizer(event))
        .rejects
        .toThrowError("GateWay tokens not received");
    });

    test('it should return unauthenticated when gateway request fails.', async () => {
      axios.post.mockImplementationOnce(() => {
        const error = new Error('Access denied');
        error.reponse = {
          status: 403,
          data: error.message
        }
        
        return Promise.reject(error);  
      });

      await expect(authorizer(event))
        .rejects
        .toThrowError("Access denied");
    });
  
    test('it should return unauthenticated payload undefined', () => {
      axios.post.mockReturnValue({ data: { access_token: 'ey12345.token', id_token: 'ey12345.token', refresh_token: 'ey12345.token' } });
      
      jwt.decode.mockReturnValue({})
      expect(authorizer(event))
        .rejects
        .toThrowError('jwt payload does not contain required user information');
    });

    test('it should return unauthenticated payload empty', () => {
      axios.post.mockReturnValue({ data: { access_token: 'ey12345.token', id_token: 'ey12345.token', refresh_token: 'ey12345.token' } });

      jwt.decode.mockReturnValue({ payload: {} })

      expect(authorizer(event))
        .rejects
        .toThrowError('jwt payload does not contain required user information');
    });

    describe('auth policy is being set',() => {
      beforeEach(() => {
        helper.setPortalRolePermissions(portalRolePermissions);
        process.env.FunctionName = "FunctionName";

        axios.post.mockReturnValue({ data: { access_token: 'ey12345.token', id_token: 'ey12345.token', refresh_token: 'ey12345.token' } });
        jwt.decode.mockReturnValue({ payload: { uid: 'uid', name: 'name', email: 'email@vt.edu' } });
      })
      
      test('successful policy creation', () => {
        mockBuild.mockReturnValueOnce({
          principalId: 'principalId',
          policyDocument: POLICY_SUCCESS.policyDocument
        });

        expect(authorizer(event, 'awsAccountId', portalRolePermissions))
          .resolves.toMatchObject(POLICY_SUCCESS);
      })
    })
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
}, { virtual: true });
jest.mock('/opt/nodejs/utils/helper', () => {
  let portalRolePermissions;

  function setPortalRolePermissions(permissions) {
    portalRolePermissions = permissions;
  }

  function lookupParams(name) {
    return portalRolePermissions;
  }

  return {
    setPortalRolePermissions,
    lookupParams
  }
}, {
  virtual: true
});