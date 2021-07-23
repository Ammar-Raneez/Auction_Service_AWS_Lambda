const createAuction = (event, context, callback) => {
    const { title } = JSON.parse(event.body);
    const currentTime = new Date();

    const auction = {
        title,
        status: 'OPEN',
        createdAt: currentTime.toISOString()
    }

    const response = {
        statusCode: 201,
        // body must always be a string
        body: JSON.stringify(auction)
    }

    callback(null, response);
}

module.export.handler = createAuction;