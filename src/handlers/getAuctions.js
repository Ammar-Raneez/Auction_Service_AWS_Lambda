const AWS = require('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async(event, context, callback) => {
    let auctions;

    try {
        const result = await dynamoDB.scan({
            TableName: process.env.DB_NAME,
        }).promise()

        auctions = result.Items;
    } catch (err) {
        console.error(err);
        throw new createError.InternalServerError(err);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }

    return response;
}

module.exports.handler = middy(getAuctions)
    .use(httpJsonBodyParser()) // automatically parsers the stringified body
    .use(httpEventNormalizer()) // automatically adjust the event object, to stop us from accessing non-existent attributes, saving room for errors
    .use(httpErrorHandler()) // make error handling smooth easy n clean