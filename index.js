const authorizer = require('./authorizer');
const warmer = require('lambda-warmer');

exports.handler = async (event) => {
  if (await warmer(event)) return 'warmed';
  if (!event || !event.requestContext) {
    throw new Error('Event object not passed to handler.')
  }

  const { apiId, stage, accountId } = event.requestContext;
  const apiOptions = {
    region: process.env.AWS_REGION,
    apiId,
    stage
  }
  try {
    return authorizer(event, accountId, apiOptions);
  } catch (error) {
    console.info('An error occurred authenticating user:', error.message);
    console.info('Event context', event.requestContext);
    return { message: error.message }
  }
}