const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get all auctions that must be closed
 * @returns - the auctions that must be closed
 */
module.exports.getToCloseAuctions = async() => {
    const now = new Date();

    const params = {
        TableName: process.env.DB_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString()
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }

    // prefer query over scanning over all
    const result = await dynamoDB.query(params).promise();

    return result.Items;
}