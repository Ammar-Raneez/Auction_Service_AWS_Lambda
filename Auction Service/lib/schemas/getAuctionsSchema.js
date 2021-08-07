// making a schema for validations
// the syntax is what is required by middy validator

module.exports.getAuctionSchema = {
    properties: {
        queryStringParameters: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    // status can only take these values
                    enum: ['OPEN', 'CLOSED'],
                    default: 'OPEN'
                }
            }
        }
    },

    // the query string parameter is needed
    required: [
        'queryStringParameters'
    ]
}