const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const customMiddleware = require('../../lib/customMiddleware');
// create our own errors
const createError = require('http-errors');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Add an auction
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 * @returns the auction that was added into the dynamoDB
 */
const createAuction = async(event, context, callback) => {
    const { title } = event.body;
    // the authorizer object has all username email stuff, sent from our Authorization service claims
    const { email } = event.requestContext.authorizer;
    const currentTime = new Date();
    const endDate = new Date();
    // auction lasts for 1 hour
    endDate.setHours(currentTime.getHours() + 1);

    const auction = {
        id: v4(),
        title,
        status: 'OPEN',
        createdAt: currentTime.toISOString(),
        endAt: endDate.toISOString(),
        // current highest bid of this auction
        highestBid: {
            amount: 0
        },
        seller: email
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