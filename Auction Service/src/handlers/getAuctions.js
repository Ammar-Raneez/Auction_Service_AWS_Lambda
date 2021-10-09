const AWS = require('aws-sdk');
const customMiddleware = require('../../lib/customMiddleware');
const createError = require('http-errors');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Query Based on status parameter
 * @param {*} event - has all stuff regarding the request
 * @param {*} context 
 * @param {*} callback 
 * @returns - all auctions that are of specific status
 */
const getAuctions = async (event, context, callback) => {
	const { status } = event.queryStringParameters;
	let auctions;

	const params = {
		TableName: process.env.DB_NAME,
		IndexName: 'statusAndEndDate',
		KeyConditionExpression: '#status = :status',
		ExpressionAttributeValues: {
				':status': status,
		},
		ExpressionAttributeNames: {
				'#status': 'status',
		},
	};

	try {
		const result = await dynamoDB.query(params).promise();
		auctions = result.Items;
	} catch (err) {
		console.error(err);
		throw new createError.InternalServerError(err);
	}

	const response = {
		statusCode: 200,
		body: JSON.stringify(auctions),
	};

	return response;
}

module.exports.handler = customMiddleware.handler(getAuctions);
