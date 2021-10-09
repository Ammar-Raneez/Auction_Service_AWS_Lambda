'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES({
	region: 'eu-west-1',
});

module.exports.handler = async (event) => {
	console.log(event);

	// the records are in Records array
	// there's only a single record due to batch size of 1
	const record = event.Records[0];

	// each record has a body, and sqs accepts only strings
	// so we will need to parse it to get is as JSON
	const email = JSON.parse(record.body);
	const { subject, body, recipient } = email;

	const params = {
		// the email that is verified in SES
		Source: 'amatendevs@gmail.com',
		Destination: {
			// array of recipients
			ToAddresses: [recipient]
		},
		Message: {
			Body: {
				// html can also be used for body
				Text: {
					Data: body,
				}
			},
			Subject: {
				Data: subject,
			}
		}
	};

    try {
			const result = await ses.sendEmail(params)
				.promise();
			return result;
    } catch (err) {
			// this function isn't triggered by API Gateway
			// so, an error http object doesn't have to be returned
			console.error(err);
    }
};
