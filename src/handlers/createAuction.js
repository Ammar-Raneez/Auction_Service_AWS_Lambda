const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
// create our own errors
const createError = require('http-errors');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createAuction = async(event, context, callback) => {
    const { title } = event.body;
    const currentTime = new Date();

    const auction = {
        id: v4(),
        title,
        status: 'OPEN',
        createdAt: currentTime.toISOString()
    }

    try {
        await dynamoDB.put({
            TableName: process.env.DB_NAME,
            Item: auction
        }).promise();
    } catch (err) {
        console.error(err);
        // own errors
        throw new createError.InternalServerError(err);
    }

    const response = {
        statusCode: 201,
        // body must always be a string
        body: JSON.stringify(auction)
    }

    return response;
}

module.exports.handler = middy(createAuction)
    .use(httpJsonBodyParser()) // automatically parsers the stringified body
    .use(httpEventNormalizer()) // automatically adjust the event object, to stop us from accessing non-existent attributes, saving room for errors
    .use(httpErrorHandler()) // make error handling smooth easy n clean