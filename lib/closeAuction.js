const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Closes a specific auction
 * @param {*} auction - which auction to close
 * @returns - closed auction
 */
module.exports.closeAuction = async(auction) => {
    const params = {
        TableName: process.env.DB_NAME,
        Key: { id: auction.id },
        // we use #status here cuz status is a reserved word in dynamoDB
        UpdateExpression: 'set #status = :status',
        // :status - the actual value, will be replaced by CLOSED
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        // so, at runtime, we specify what #status actually is, set status value to CLOSED
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    const result = await dynamoDB.update(params).promise();
    return result;
}