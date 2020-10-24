const AuthPolicy = require('/opt/nodejs/utils/AuthPolicy');

function getAuthorizationCode({ queryStringParameters = null }) {
  if (!queryStringParameters || !queryStringParameters.code) {
    throw new Error('Expected valid code in query string parameters.');
  }

  return queryStringParameters.code;
}

const rolesMapping = (edUserInfo, { ROLES = null }) => {
  if (!edUserInfo || !ROLES) {
    throw new Error('User ed info and portal roles must be provided')
  }
  const userRoles = [];
  const { groups, vtAffiliations, userId } = edUserInfo;
  const roles = Object.keys(ROLES);

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const { edGroups = [], affiliations = [], pids = [], name } = ROLES[role];

    if (groups.some(group => edGroups.includes(group)) ||
      vtAffiliations.some(v => affiliations.includes(v)) ||
      pids.includes(userId)
    ) {
      userRoles.push(name);
    }
  }

  return userRoles
}

const createPolicy = (userRoles, principalId, awsAccountId, apiOptions, portalRolePermissions) => {
  const policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
  if (!userRoles || userRoles.length < 1) {
    policy.denyAllMethods();
    return policy.build();
  }

  if (!principalId || !awsAccountId || !apiOptions || !portalRolePermissions) {
    throw new Error('Create policy is called without the required parameters');
  }

  userRoles.forEach(userRole => {
    portalRolePermissions.CUSTOMER_PORTAL_APPS.forEach(application => {
      application.roles.forEach(appRole => {

        const roleKey = appRole.substring(appRole.indexOf(".") + 1);
        const matchingRole = portalRolePermissions.ROLES[roleKey] || [];

        if (userRole === matchingRole.name) {
          const iamKeys = Object.keys(application.iam);

          iamKeys.forEach(iamKey => {
            application.iam[iamKey].operations.forEach(operation => {
              const [method] = operation.split('-');
              const path = operation.substring(method.length + 1);

              policy.allowMethod(method.toUpperCase(), path);
            })
          });
        }
      });
    });
  });

  return policy.build();
}

module.exports = {
  getAuthorizationCode,
  rolesMapping,
  createPolicy
}