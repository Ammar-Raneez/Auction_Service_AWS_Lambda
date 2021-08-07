const createError = require('http-errors');
const { getToCloseAuctions } = require('../../lib/getToCloseAuctions');
const { closeAuction } = require("../../lib/closeAuction")

/**
 * Performs the closing of all specified auctions
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 * @returns how many auctions that were closed
 */
module.exports.handler = async(event, context, callback) => {
    try {
        const auctionsToClose = await getToCloseAuctions();
        const auctionsToClosePromises = auctionsToClose.map(auction => closeAuction(auction));
        // wait till all auctions are closed
        await Promise.all(auctionsToClosePromises);

        return { amountClosed: auctionsToClosePromises.length };
    } catch (err) {
        console.error(err);
        throw new createError.InternalServerError(err);
    }
}