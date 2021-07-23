const AWS = require('aws-sdk');
const createError = require('http-errors');
const customMiddleware = require('../../lib/customMiddleware');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.getAuctionById = async(id) => {
    let auction;

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

    return auction;
}

const getAuction = async(event, context, callback) => {
    const { id } = event.pathParameters;
    let auction = await this.getAuctionById(id);

    if (!auction) {
        throw new createError.NotFound(`Auction with ${id} not found`)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(auction)
    }

    return response;
}

module.exports.handler = customMiddleware.handler(getAuction)