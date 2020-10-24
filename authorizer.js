const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const axios = require('axios');
const helper = require('/opt/nodejs/utils/helper');
const utils = require('./utils');

async function authorizer(event, awsAccountId, apiOptions) {
  if (
    !event.headers ||
    !event.headers.StackId ||
    event.headers.StackId != process.env.STACK_ID
  ) {
    throw new Error('Expected valid CloudFront custom header');
  }

  const portalRolePermissions = await helper.lookupParams('portalRolePermissions', process.env.PARAMS_TABLE);
  const authorizationCode = utils.getAuthorizationCode(event);

  if (!portalRolePermissions || !portalRolePermissions.CUSTOMER_PORTAL_APPS || !portalRolePermissions.ROLES || !authorizationCode) {
    throw new Error('portalRolePermissions and authorization code must be defined.');
  }

  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error('client id and secret must be set');
  }

  const { data } = await axios.post(
    `${process.env.TOKEN_ISSUER}/oauth2/token`,
    null, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
    },
    params: {
      grant_type: "authorization_code",
      code: authorizationCode,
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI
    }
  }
  );

  if (!data.access_token || !data.id_token) {
    throw new Error('GateWay tokens not received');
  }

  const { payload } = jwt.decode(data.id_token, { complete: true });
  if (!payload || !payload.uid || !payload.name || !payload.email) {
    throw new Error('jwt payload does not contain required user information');
  }

  const { Payload } = await lambda.invoke({
    FunctionName: process.env.FunctionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: `{ "uid" : ${payload.uid} }`
  }).promise();
  const edUserInfo = JSON.parse(Payload);
  const userRoles = utils.rolesMapping(edUserInfo, portalRolePermissions);
  const sessionId = uuid();

  const policy = utils.createPolicy(userRoles, sessionId, awsAccountId, apiOptions, portalRolePermissions);
  policy.context = {
    sessionId: sessionId,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    uid: payload.uid,
    pid: edUserInfo.userId,
    telephoneNumber: edUserInfo.telephoneNumber,
    userName: payload.name,
    email: payload.email,
    edGroups: JSON.stringify(edUserInfo.groups),
    userRoles: JSON.stringify(userRoles)
  };

  return policy;
}

module.exports = authorizer;