const AWS = require('aws-sdk');
const createError = require('http-errors');
const customMiddleware = require('../../lib/customMiddleware');
const { getAuctionById } = require('./getAuction');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Places a bid on a specified auction
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 * @returns the updated auction
 */
const placeBid = async(event, context, callback) => {
    const { id } = event.pathParameters;
    // bid amount
    const { amount } = event.body;
    // bidder
    const { email } = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    // auction not present itself
    if (!auction) {
        throw new createError.NotFound(`Auction with ${id} not found`);
    }

    // bidder cannot be seller
    if (email === auction.seller) {
        throw new createError.Forbidden('You cannot bid on your own auctions!');
    }

    // cannot bid consecutively
    if (email === auction.highestBid.bidder) {
        throw new createError.Forbidden('You area already the highest bidder!');
    }

    // auction cannot be bid if already closed
    if (auction.status === 'CLOSED') {
        throw new createError.Forbidden('You cannot bid on CLOSED auctions');
    }

    // no biddings less than current highest amount
    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Cannot place a bid that is less than the current bid - ${auction.highestBid.amount}`);
    }

    const params = {
        TableName: process.env.DB_NAME,
        Key: { id },
        // set the highestBid.amount to the actual amount value
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder', // update method
        // what does the updating
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email,
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