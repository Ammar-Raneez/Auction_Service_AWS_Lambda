'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: 'us-east-1'
})

module.exports.handler = async (event) => {
    // there's only a single record due to batch size of 1
    const record = event.Records[0];

    const email = JSON.parse(record.body);
    const { subject, body, recipient } = email;

    const params = {
        // the email that is verified in SES
        Source: 'ammarraneez@gmail.com',
        Destination: {
            // array of recipients
            ToAddresses: [recipient]
        },
        Message: {
            Body: {
                // html can also be used for body
                Text: {
                    Data: body
                }
            },
            Subject: {
                Data: subject
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
