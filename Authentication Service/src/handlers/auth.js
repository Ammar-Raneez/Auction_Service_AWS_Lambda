'use strict';

const jwt = require('jsonwebtoken')

// By default, API Gateway authorizations are cached for 300s.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, this being inefficient and optimizing costs
// this function will be triggered by the http triggers of the auction service
const generatePolicy = (principalId, methodArn) => {
    // generates a policy that allows the invocation of any lambda functions
    // in the target APi Gateway
    const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

    // once a lambda calls this once, and the token is verified, we are authorized for 300s 
    // therefore, saving a serious number of lambda calls just for a single user
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: apiGatewayWildcard,
            }, ],
        },
    };
}

module.exports.handler = (event, context, callback) => {
    // no authorization token
    if (!event.authorizationToken) {
        throw 'Unauthorized';
    }

    // the Bearer is appended, remember postman
    const token = event.authorizationToken.replace('Bearer ', '');

    try {
        const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
        const policy = generatePolicy(claims.sub, event.methodArn);

        const response = {
            ...policy,
            // username, email, id, any extra function
            context: claims
        }

        // callback(response);
        return response;
    } catch (err) {
        console.log(err);
        throw 'Unauthorized';
    }
};