const AWS = require('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuction = async(event, context, callback) => {
    let auction;
    const { id } = event.pathParameters;

    try {
        const result = await dynamoDB.get({
            TableName: process.env.DB_NAME,
            Key: { id }
        }).promise();

        auction = result.Item;
    } catch (err) {
        console.error(err);
        throw new createError.InternalServerError(err);
    }

    if (!auction) {
        throw new createError.NotFound(`Auction with ${id} not found`)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(auction)
    }

    return response;
}

module.exports.handler = middy(getAuction)
    .use(httpJsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpErrorHandler())