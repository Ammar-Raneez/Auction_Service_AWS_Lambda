const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const customMiddleware = require('../../lib/customMiddleware');
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
        createdAt: currentTime.toISOString(),
        // current highest bid of this auction
        highestBid: {
            amount: 0
        }
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

module.exports.handler = customMiddleware.handler(createAuction)