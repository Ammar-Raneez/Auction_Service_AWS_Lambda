const createError = require('http-errors');
const { getToCloseAuctions } = require('../../lib/getToCloseAuctions');
const { closeAuctions } = require("../../lib/closeAuctions")

module.exports.handler = async(event, context, callback) => {
    try {
        const auctionsToClose = await getToCloseAuctions();
        const auctionsToClosePromises = auctionsToClose.map(auction => closeAuctions(auction));
        // wait till all auctions are closed
        await Promise.all(auctionsToClosePromises);

        return { amountClosed: auctionsToClosePromises.length };
    } catch (err) {
        console.error(err);
        throw new createError.InternalServerError(err);
    }
}