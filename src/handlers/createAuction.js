const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createAuction = async(event, context, callback) => {
    const { title } = JSON.parse(event.body);
    const currentTime = new Date();

    const auction = {
        id: v4(),
        title,
        status: 'OPEN',
        createdAt: currentTime.toISOString()
    }

    await dynamoDB.put({
        TableName: 'AuctionsTable',
        Item: auction
    }).promise();

    const response = {
        statusCode: 201,
        // body must always be a string
        body: JSON.stringify(auction)
    }

    callback(null, response);
}

module.exports.handler = createAuction;