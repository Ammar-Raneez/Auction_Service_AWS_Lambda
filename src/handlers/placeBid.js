const AWS = require('aws-sdk');
const createError = require('http-errors');
const customMiddleware = require('../../lib/customMiddleware');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const placeBid = async(event, context, callback) => {
    const { id } = event.pathParameters;
    // bid amount
    const { amount } = event.body;

    const params = {
        TableName: process.env.DB_NAME,
        Key: { id },
        // set the highestBid.amount to the actual amount value
        UpdateExpression: 'set highestBid.amount = :amount', // update method
        // what does the updating
        ExpressionAttributeValues: {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW'
    }

    let updatedAuction;

    try {
        const result = await dynamoDB.update(params).promise();
        updatedAuction = result;
    } catch (err) {
        console.error(err);
        throw new createError.InternalServerError(err);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }

    return response;
}

module.exports.handler = customMiddleware.handler(placeBid)