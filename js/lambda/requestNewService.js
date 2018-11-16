/*An AWS Lambda micro service meant to allow support for offering new services*/

/*AWS sdk module requirements*/
const uuid = require('uuid');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/*Constants*/
const CREATED = 201;
const CONFLICT = 409;

/*Classes*/
/**
 * A service is something, basically anything, that someone can offer to the public and other can buy it. Ex. provider can offer to bake 5 breads for anyone who is willing to pay for it.
 *
 * @param {String} description - describes what type of service this is
 * @param {Number} cost - the price of the service
 * @param {Integer} providerId - the id of the provider
 * @param {Date} timeToDeliver - deadline delivery
 * @param {Integer} quantity - how many times can the provider provide this service
 */
class Service {
    constructor(description, cost, providerId, timeToDeliver, quantity) {
        this._id = uuid.v1();
        this._description = description;
        this._cost = cost;
        this._providerId = providerId;
        this._timeToDeliver = timeToDeliver; //Date object
        this._quantity = quantity;
    }

    get id() {
        return this._id;
    }

    get description() {
        return this._description;
    }

    get cost() {
        return this._cost;
    }

    set cost(cost) {
        this._cost = cost;
    }

    get providerId() {
        return this._providerId;
    }

    get timeToDeliver() {
        return this._timeToDeliver;
    }

    set timeToDeliver(date) {
        this._timeToDeliver = date;
    }

    get quantity() {
        return this._quantity;
    }

    set quantity(quantity) {
        if (quantity >= 0) {
            this._quantity = quantity;
        }
    }
}

/*Functions*/
/**
 * Stores a service to DB
 *
 * @param {Service} service - Service object to record
 *
 * @returns {Promise} that holds the result of the operation
 */
function recordService(service) {

    var params = {
        TableName: 'Services',
        Item: {
            'id': service.id,
            'description': service.description,
            'cost': service.cost,
            'providerId': service.providerId,
            'timeToDeliver': service.timeToDeliver,
            'quantity': service.quantity
        }
    };

    return ddb.put(params, function (err, data) {
        if (err) {
            console.error('Unable to add transaction. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded ', JSON.stringify(data));
        }
    }).promise();
}

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500, //500 = internal server error
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

/*The lambda function*/
exports.handler = (event, context, callback) => {
    //Checking if the Auth exists
    if (!event.requestContext.authorizer) {
        errorResponse('Authorization not configured', context.awsRequestId, callback);
        return;
    }

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const username = event.requestContext.authorizer.claims['cognito:username'];

    // The body field of the event in a proxy integration is a raw string.
    // In order to extract meaningful values, we need to first parse this string
    // into an object. A more robust implementation might inspect the Content-Type
    // header first and use a different parsing strategy based on that value.
    const requestBody = JSON.parse(event.body);

    const description = requestBody.description;
    const cost = requestBody.cost;
    const providerID = requestBody.providerId;
    const timeToDeliver = requestBody.timeToDeliver;
    const quantity = requestBody.quantity;

    const newService = new Service(description, cost, providerID, timeToDeliver, quantity);

    recordService(newService).then(() => {
        callback(null, {
            statusCode: CREATED,
            body: JSON.stringify(newService),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);

        // If there is an error during processing, catch it and return
        // from the Lambda function successfully. Specify a 500 HTTP status
        // code and provide an error message in the body. This will provide a
        // more meaningful error response to the end client.
        errorResponse(err.message, context.awsRequestId, callback)
    });
};