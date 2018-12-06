/*An AWS Lambda micro service meant to allow support for purchasing services*/

/*AWS sdk module requirements*/
const uuid = require('uuid');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/*Constants*/
const CREATED = 201;
const CONFLICT = 409;
const UNAVAILABLE_QUANTITY_MSG = "the request cannot be completed since the requested quantity is not available in inventory";

/*Variables*/
const queueUrl = "";

// Instantiate SQS.
var sqs = new AWS.SQS();

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
function recordTransaction(transaction) {
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
    var res = ddb.get(params, function (err, data) {
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

    return ddb.update(params, function (err, data) {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
        }
    }).promise();
}

/*The lambda function*/
exports.handler = (event, context, callback) => {
    // The body field of the event in a proxy integration is a raw string.
    // In order to extract meaningful values, we need to first parse this string
    // into an object. A more robust implementation might inspect the Content-Type
    // header first and use a different parsing strategy based on that value.
    const requestBody = JSON.parse(event.body);

    const serviceIdRequested = requestBody.serviceID;
    const requestedServiceQuantity = requestBody.quantity;
    const providerUN = requestBody.providerUN;
    const consumerUN = requestBody.consumerUN;

    getServiceQuantity(serviceIdRequested).then((availableQuantity) => {
        if ((availableQuantity - requestedServiceQuantity) >= 0) {

            /*Updating the quantity in the DB*/
            updateServiceQuantity(serviceIdRequested, (availableQuantity - requestedServiceQuantity)).then(() => {
                /*Once we've updated the quantity we can document the transaction*/
                const transaction = new Transaction(serviceIdRequested, requestedServiceQuantity, providerUN, consumerUN);

                /*Preparing the message to be sent to the queue*/
                const messageParams = {
                    MessageBody: JSON.stringify(transaction),
                    QueueUrl: queueUrl,
                    DelaySeconds: 0
                };

                var statusCodeToReturn = CREATED;

                /*Sending the message to the queue*/
                sqs.sendMessage(messageParams, function (err, data) {
                    if(err) {
                        //Sending the message was unsuccessful
                        statusCodeToReturn = CONFLICT;
                    }
                    else {
                        /*Do nothing since the message was sent*/
                    }
                });

                /*
                When we're done with writing the transaction to the DB we can
                return the response to the proxy
                */
                callback(null, {
                    statusCode: statusCodeToReturn,
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