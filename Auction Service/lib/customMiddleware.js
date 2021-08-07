const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const middy = require('@middy/core');

/**
 * Custom middleware for feasability
 * @param {*} handler 
 * @returns - function, having applied all middleware
 */
module.exports.handler = handler => middy(handler)
    .use([
        httpJsonBodyParser(), // automatically parsers the stringified body
        httpEventNormalizer(), // automatically adjust the event object, to stop us from accessing non-existent attributes, saving room for errors
        httpErrorHandler() // make error handling smooth easy n clean
    ])