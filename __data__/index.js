const edUserInfo = {
  groups: ['nis.org._ed2', 'nis.org.ed_2', 'nis.org.ed_3'],
  vtAffiliations: ['VT-EMPLOYEE'],
  userId: 'user123',
  telephoneNumber: '0317621809'
};

const portalRolePermissions = {
  ROLES: {
    ACCOUNT_OWNER: {
      name: "accountOwner",
      edGroups: ["nis.org.ed_1", "nis.org.ed_2", "nis.org.ed_4"],
      affiliations: []
    },
    ACCOUNT_ADMIN: {
      name: "accountAdmin",
      edGroups: [],
      affiliations: []
    },
    BILLING_MANAGER: {
      name: "billingManager",
      edGroups: [],
      affiliations: []
    },
    SERVICE_MANAGER: {
      name: "serviceManager",
      edGroups: ["nis.role.ed_4", "nis.role.ed_5"],
      affiliations: []
    },
    NETWORK_MANAGER: {
      name: "networkManager",
      edGroups: [],
      affiliations: []
    },
    PROJECT_MANAGER: {
      name: "projectManager",
      edGroups: [],
      affiliations: []
    },
    SERVICE_USER: {
      name: "serviceUser",
      edGroups: [],
      affiliations: []
    },
    EMPLOYEE: {
      name: "employee",
      edGroups: [],
      affiliations: ["VT-EMPLOYEE"]
    },
    STUDENT: {
      name: "student",
      edGroups: [],
      affiliations: ["VT-STUDENT"]
    },
    USER: {
      name: "user",
      edGroups: [],
      affiliations: ["VT-STUDENT", "VT-EMPLOYEE"]
    }
  },
  CUSTOMER_PORTAL_APPS: [{
      name: "applications",
      title: "Applications",
      userFacing: "false",
      roles: ["ROLES.USER"],
      hateoas: {
        applications: {
          permissions: ["PERMISSIONS.READ"]
        }
      },
      iam: {
        login: {
          operations: ["GET-/applications"]
        }
      }
    },
    {
      name: "loginLogout",
      title: "Login/Logout",
      userFacing: "false",
      roles: ["ROLES.USER"],
      hateoas: {
        login: {
          permissions: ["PERMISSIONS.READ"]
        },
        logout: {
          permissions: ["PERMISSIONS.READ"]
        }
      },
      iam: {
        login: {
          operations: ["GET-/login"]
        },
        logout: {
          operations: ["GET-/logout", "POST-/logout"]
        }
      }
    }, {
      name: "wirelessDevices",
      title: "Wireless Devices",
      category: "Tools",
      reactAdminResource: "wireless",
      additionalReactAdminResources: ["user-service-groups"],
      userFacing: "true",
      onClick: "/wireless",
      roles: ["ROLES.USER"],
      hateoas: {
        '/devices/wireless': {
          permissions: ["PERMISSIONS.CREATE", "PERMISSIONS.READ", "PERMISSIONS.UPDATE", "PERMISSIONS.DELETE"]
        },
        '/devices/wireless/service-groups': {
          permissions: ["PERMISSIONS.READ"]
        },
        '/devices/wireless/user-service-groups': {
          permissions: ["PERMISSIONS.READ"]
        }
      },
      iam: {
        wireless: {
          operations: ["GET-/devices/wireless", "POST-/devices/wireless", "GET-/devices/wireless/*", "PUT-/devices/wireless/*", "DELETE-/devices/wireless/*"]
        },
        serviceGroups: {
          operations: ["GET-/devices/wireless/service-groups", "GET-/devices/wireless/service-groups/*"]
        },
        userServiceGroups: {
          operations: ["GET-/devices/wireless/user-service-groups", "GET-/devices/wireless/user-service-groups/*"]
        }
      }
    }, {
      name: "request",
      title: "Estimate Request",
      category: "Projects",
      reactAdminResource: "request",
      userFacing: "true",
      onClick: "/request/create",
      roles: ["ROLES.USER"],
      hateoas: {
        '/estimate/request': {
          permissions: ["PERMISSIONS.CREATE", "PERMISSIONS.READ"]
        }
      },
      iam: {
        estimate: {
          operations: ["GET-/estimate/request", "POST-/estimate/request"]
        },
        whoami: {
          operations: ["GET-/whoami/*"]
        }
      }
    }
  ]
};

const EVENT_SUCCESS = {
  queryStringParameters: {
    code: 1234567890
  }
}

const EVENT_FAIL = {
  queryStringParameters: {
    null: null
  }
}

const POLICY_SUCCESS = {
  principalId: 'principalId',
  policyDocument: [{
      method: 'GET',
      path: '/applications'
    },
    {
      method: 'GET',
      path: '/login'
    },
    {
      method: 'GET',
      path: '/logout'
    },
    {
      method: 'POST',
      path: '/logout'
    },
    {
      method: 'GET',
      path: '/devices/wireless'
    },
    {
      method: 'POST',
      path: '/devices/wireless'
    },
    {
      method: 'GET',
      path: '/devices/wireless/*'
    },
    {
      method: 'PUT',
      path: '/devices/wireless/*'
    },
    {
      method: 'DELETE',
      path: '/devices/wireless/*'
    },
    {
      method: 'GET',
      path: '/devices/wireless/service-groups'
    },
    {
      method: 'GET',
      path: '/devices/wireless/service-groups/*'
    },
    {
      method: 'GET',
      path: '/devices/wireless/user-service-groups'
    },
    {
      method: 'GET',
      path: '/devices/wireless/user-service-groups/*'
    },
    {
      method: 'GET',
      path: '/estimate/request'
    },
    {
      method: 'POST',
      path: '/estimate/request'
    },
    {
      method: 'GET',
      path: '/whoami/*'
    }
  ],
  context: {
    sessionId: '0987654321',
    accessToken: 'ey12345.token',
    refreshToken: 'ey12345.token',
    idToken: 'ey12345.token',
    uid: 'uid',
    pid: 'user123',
    telephoneNumber: '0317621809',
    userName: 'name',
    email: 'email@vt.edu',
    edGroups: '["nis.org._ed2","nis.org.ed_2","nis.org.ed_3"]',
    userRoles: '["accountOwner","employee","user"]'
  }
};

const EVENT = {
  headers: {
    StackId: 12345
  },
  queryStringParameters: {
    code: "9Nk7k6NxUkz2Tjb0WSCxZd"
  },
  requestContext: {
    resourceId: "wddpna",
    resourcePath: "/login",
    httpMethod: "GET",
    extendedRequestId: "QFcwgEOUoAMFxPg=",
    requestTime: "22/Jul/2020:17:18:07 +0000",
    path: "/Prod/login",
    accountId: "233814489528",
    protocol: "HTTP/1.1",
    stage: "Prod",
    domainPrefix: "ukw0v2llr0",
    requestTimeEpoch: 1595438287952,
    requestId: "a9fb6a2f-c994-44c4-aa48-7d12ef21dbf0",
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      sourceIp: "69.162.230.101",
      principalOrgId: null,
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
      user: null
    },
    domainName: "ukw0v2llr0.execute-api.us-east-1.amazonaws.com",
    apiId: "ukw0v2llr0"
  }
}

module.exports = {
  edUserInfo,
  portalRolePermissions,
  EVENT_FAIL,
  EVENT_SUCCESS,
  POLICY_SUCCESS,
  EVENT
}