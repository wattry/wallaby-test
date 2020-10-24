const { getAuthorizationCode, rolesMapping, createPolicy } = require('../../utils');
const {
  edUserInfo,
  portalRolePermissions,
  EVENT_FAIL,
  EVENT_SUCCESS,
  POLICY_SUCCESS
} = require('../../__data__');
const mockBuild = jest.fn();
const mockAllow = jest.fn();

jest.mock('/opt/nodejs/utils/AuthPolicy', () => {
  return function () {
    return ({
      denyAllMethods: jest.fn(),
      build: mockBuild,
      allowMethod: mockAllow
    })
  }
}, {
  virtual: true
});

describe('utils', () => {
  describe('getAuthorizationCode', () => {

    test('it throws when event is undefined', () => {
      expect(() => getAuthorizationCode(undefined)).toThrowError("Cannot read property 'queryStringParameters' of undefined");
    });

    test('it throws when event is empty', () => {
      expect(() => getAuthorizationCode({})).toThrow('Expected valid code in query string parameters.');
    });

    test('it throws when queryString is empty', () => {
      expect(() => getAuthorizationCode({ queryStringParameters: {} })).toThrow('Expected valid code in query string parameters.');
    });

    test('it throws when code is invalid', () => {
      expect(() => getAuthorizationCode(EVENT_FAIL)).toThrow('Expected valid code in query string parameters.');
    });

    test('it return a code', () => {
      expect(getAuthorizationCode(EVENT_SUCCESS)).toEqual(1234567890);
    });
  });

  describe('roleMapping', () => {
    test('it throws when edUser and ROLES are undefined', () => {
      expect(() => rolesMapping(undefined, undefined)).toThrowError("Cannot read property 'ROLES' of undefined");
    });

    test('it throws when edUser and ROLES are empty', () => {
      expect(() => rolesMapping({}, {})).toThrowError("User ed info and portal roles must be provided");
    });

    test('it returns a users customer portal role mapped', () => {
      expect(rolesMapping(edUserInfo, portalRolePermissions)).toEqual(["accountOwner", "employee", "user"])
    })
  });

  describe('createPolicy', () => {
    afterEach(() => {
      mockBuild.mockRestore();
      mockAllow.mockRestore();
    });

    let userRoles = null;
    beforeAll(() => {
      userRoles = rolesMapping(edUserInfo, portalRolePermissions);
    })

    test('it denies all routes if user has no roles.', () => {
      mockBuild.mockReturnValue({ denyAll: true });

      expect(createPolicy()).toEqual({ denyAll: true })
    });

    test('it throws when all parameters are not provided', () => {
      expect(() => createPolicy(userRoles)).toThrowError('Create policy is called without the required parameters')
    });

    test('it throws when principleId is falsey', () => {
      expect(() => createPolicy(userRoles, undefined)).toThrowError('Create policy is called without the required parameters')
    });

    test('it throws when awsAccountId is falsey', () => {
      expect(() => createPolicy(userRoles, undefined)).toThrowError('Create policy is called without the required parameters')
    });

    test('it throws when awsAccountId is falsey', () => {
      const policyDocument = []
      mockAllow.mockImplementation((method, path) => {
        return policyDocument.push({ method, path });
      });

      mockBuild.mockReturnValue({ principalId: 'principalId', policyDocument });
      expect(createPolicy(userRoles, " ", " ", " ", portalRolePermissions))
        .toEqual({
          principalId: POLICY_SUCCESS.principalId,
          policyDocument: POLICY_SUCCESS.policyDocument
        })
    });
  });
});

