/*<What does this file do>*/

/*AWS sdk module requirements*/
const uuid = require('uuid');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/*Constants*/
const CREATED = 201;
const CONFLICT = 409;
const UNAVAILABLE_QUANTITY_MSG = "the request cannot be completed since the requested quantity is not available in inventory";

/*Classes*/
/**
 * Class representing a successful transaction between a provider
 * and a consumer.
 *
 * @param {String} serviceID - the ID of the service that is being bought
 * @param {Integer} quantity - the quantity of service being bought
 * @param {String} providerUN - object containing provider data
 * @param {String} consumerUN - object containing consumer data
 */
class Transaction {
    constructor(serviceID, quantity, providerUN, consumerUN) {

        this._id = uuid.v1();
        this._serviceID = serviceID;
        this._quantity = quantity;
        this._providerUN = providerUN;
        this._consumerUN = consumerUN;
        this._dateCreated = Date.now();
    }

    get id() {
        return this._id;
    }

    get serviceID() {
        return this._serviceID;
    }

    get quantity() {
        return this._quantity;
    }

    get providerUN() {
        return this._providerUN;
    }

    get consumerUN() {
        return this._consumerUN;
    }

    get dateCreated() {
        return this._dateCreated;
    }
}

/*Functions*/
function recordTransaction(id, title, provider, consumer) {
    const params = {
        TableName: 'Transactions',
        Item: {
            'id': transaction.id,
            'serviceID': transaction.serviceID,
            'quantity': transaction.quantity,
            'providerUN': transaction.providerUN,
            'consumerUN': transaction.consumerUN,
            'dateCreated': transaction.dateCreated
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

/**
 * Fetch a service from the DB by it's id.
 *
 * @param   {UUID}      id - the uuid of the service
 * @returns {Promise}   a promise that it's callback contains the service or any error if happen
 */
function getServiceByID(id) {
    var params = {
        TableName: 'Services',
        Key: {
            'id': id
        },
        ReturnValues: 'ALL_NEW'
    };
    var res = docClient.get(params, function (err, data) {
        if (err) {
            console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
        }
    }).promise();

    return res;
}

/**
 * Get service quantity from DB.
 *
 * @param   {UUID}      serviceId - the uuid of the service
 * @returns {Integer}   quantity available of that service
 */
async function getServiceQuantity(serviceId) {
    var s = await getServiceByID(serviceId);

    return s.Item.quantity;
}

/**
 * Update service quantity in DB
 *
 * @param {String} serviceID - the id of the service
 * @param {Integer} quantity - the new value for the quantity of the service available

 * @returns {Promise} that can be hooked when we get a response from AWS
 */
function updateServiceQuantity(serviceID, quantity) {
    var params = {
        TableName: 'Services',
        Key: {
            'id': serviceID
        },
        UpdateExpression: 'set quantity = :q',
        ExpressionAttributeValues: {
            ':q': quantity
        },
        ReturnValues: 'ALL_NEW'
    };

    return docClient.update(params, function (err, data) {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
        }
    }).promise();
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

    const serviceIdRequested = requestBody.serviceID;
    const requestedServiceQuantity = requestBody.quantity;
    const providerUN = requestBody.providerUN;
    const consumerUN = requestBody.consumerUN;

    getServiceQuantity(serviceId).then((availableQuantity) => {
        if ((availableQuantity - requestedServiceQuantity) >= 0) {

            /*Updating the quantity in the DB*/
            updateServiceQuantity(serviceIdRequested, requestedServiceQuantity).then(() => {
                /*Once we've updated the quantity we can document the transaction*/
                const transaction = new Transaction(serviceIdRequested, requestedServiceQuantity, providerUN, consumerUN);

                /*
                When we're done with writing the trnasaction to the DB we can
                return the response to the proxy
                */
                recordTransaction(transaction).then(() => {
                    // You can use the callback function to provide a return value from your Node.js
                    // Lambda functions. The first parameter is used for failed invocations. The
                    // second parameter specifies the result data of the invocation.

                    // Because this Lambda function is called by an API Gateway proxy integration
                    // the result object must use the following structure.
                    callback(null, {
                        statusCode: CREATED,
                        body: JSON.stringify({
                            id: transaction.id,
                            serviceID: transaction.serviceID,
                            quantity: transaction.quantity,
                            providerUN: transaction.providerUN,
                            consumerUN: transaction.consumerUN,
                            dateCreated: transaction.dateCreated
                        }),
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
            });
        }
        /*
        In case the requested quantity was not available to supply
        we simply return a status code stating there was a conflict
        between the request, and the inventory, and an appropriate
        message stating this
        */
        else {
            callback(null, {
                statusCode: CONFLICT,
                body: UNAVAILABLE_QUANTITY_MSG,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    });
};