/*<What does this file do>*/

/*AWS sdk module requirements*/
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

/*Constants*/
const OK = 200;

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

    const unicorn = findUnicorn(pickupLocation);

    getServicesForSell().then((value) => {
        // You can use the callback function to provide a return value from your Node.js
        // Lambda functions. The first parameter is used for failed invocations. The
        // second parameter specifies the result data of the invocation.

        // Because this Lambda function is called by an API Gateway proxy integration
        // the result object must use the following structure.
        callback(null, {
            statusCode: OK,
            body: JSON.stringify(value),
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
        ProjectionExpression: '#sid, description, cost, provider, timeToDeliver, quantity',
        FilterExpression: 'quantity >= :expect_quantity',
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