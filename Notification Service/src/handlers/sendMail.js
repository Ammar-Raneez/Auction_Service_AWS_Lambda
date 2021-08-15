'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: 'us-east-1'
})

module.exports.handler = async (event) => {
    const params = {
        // the email that is verified in SES
        Source: 'ammarraneez@gmail.com',
        Destination: {
            // array of recipients
            ToAddresses: ['ammarraneez@gmail.com']
        },
        Message: {
            Body: {
                // html can also be used for body
                Text: {
                    Data: 'Hello :)'
                }
            },
            Subject: {
                Data: 'Test Mail!'
            }
        }
    }

    try {
        const result = await ses.sendEmail(params)
            .promise();
        return result;
    } catch (err) {
        // this function isn't triggered by API Gateway
        // so, and error object doesn't have to be returned
        console.error(err);
    }
};
