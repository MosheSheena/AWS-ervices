/*An AWS Lambda micro service meant to allow support for getting all available services*/

/*AWS sdk module requirements*/
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/*Constants*/
const OK = 200;

/*The lambda function*/
exports.handler = (event, context, callback) => {
    // The body field of the event in a proxy integration is a raw string.
    // In order to extract meaningful values, we need to first parse this string
    // into an object. A more robust implementation might inspect the Content-Type
    // header first and use a different parsing strategy based on that value.

    getServicesForSell().then((servicesForSale) => {
        // You can use the callback function to provide a return value from your Node.js
        // Lambda functions. The first parameter is used for failed invocations. The
        // second parameter specifies the result data of the invocation.

        // Because this Lambda function is called by an API Gateway proxy integration
        // the result object must use the following structure.
        callback(null, {
            statusCode: OK,
            body: JSON.stringify(servicesForSale),
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

function getServicesForSell() {
    const params = {
        TableName: 'Services',
        ProjectionExpression: '#sid, description, cost, providerId, quantity, timeToDeliver',
        FilterExpression: 'quantity > :expect_quantity',
        ExpressionAttributeNames: {
            '#sid': 'id'
        },
        ExpressionAttributeValues: {
            ':expect_quantity': 0
        }
    };

    return ddb.scan(params, onScan).promise();
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
 * Callback for scanning the DB.
 * @param {Object} err - error object
 * @param {Object} data - response data containing the Items we scanned for.
 * @returns {undefined}
 */
function onScan(err, data) {
    if (err) {
        console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
        console.log('Scan succeeded.');

        /*
         * Continue scanning if we have more movies, because
         * scan can retrieve a maximum of 1MB of data
         */
        if (typeof data.LastEvaluatedKey != 'undefined') {
            console.log('Scanning for more...');
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            ddb.scan(params, onScan);
        }
    }
}
