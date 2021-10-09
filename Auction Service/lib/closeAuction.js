const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

/**
 * Closes a specific auction
 * @param {*} auction - which auction to close
 * @returns - closed auction
 */
module.exports.closeAuction = async(auction) => {
	const params = {
		TableName: process.env.DB_NAME,
		Key: { id: auction.id, },

		// we use #status here cuz status is a reserved word in dynamoDB
		UpdateExpression: 'set #status = :status',

		// :status - the actual value, will be replaced by CLOSED
		ExpressionAttributeValues: {
			':status': 'CLOSED',
		},

		// so, at runtime, we specify what #status actually is, set status value to CLOSED
		ExpressionAttributeNames: {
			'#status': 'status',
		},
	}

	await dynamoDB.update(params).promise();

	const { title, seller, highestBid } = auction;
	const { amount, bidder } = highestBid;

	if (amount === 0) {
		await sqs.sendMessage({
			QueueUrl: process.env.MAIL_QUEUE_URL,
			MessageBody: JSON.stringify({
				subject: 'No bids on your auction item :(',
				recipient: seller,
				body: `Oh no! Your item "${title}" didn't get any bids. Better luck next time!`,
			}),  
		}).promise();
		return;
	}

	// send messages to both seller and bidder
	const notifySeller = sqs.sendMessage({
		QueueUrl: process.env.MAIL_QUEUE_URL,
		MessageBody: JSON.stringify({
			subject: 'Your item has been sold',
			recipient: seller,
			body: `Wohoo! Your item ${title} has been sold for $${amount}`,
		}),
	}).promise();

	const notifyBidder = sqs.sendMessage({
		QueueUrl: process.env.MAIL_QUEUE_URL,
		MessageBody: JSON.stringify({
			subject: 'You won an auction!',
			recipient: bidder,
			body: `What a great deal! You got yourself a "${title}" for $${amount}`,
		}),
	}).promise();

	// run both of these, order doesn't matter
	return Promise.all([notifyBidder, notifySeller]);
}
