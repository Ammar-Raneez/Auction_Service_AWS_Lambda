const AWS = require('aws-sdk');
const customMiddleware = require('../../lib/customMiddleware');
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

module.exports.handler = customMiddleware(getAuctions)