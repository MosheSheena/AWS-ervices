var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

var sqs = new AWS.SQS();

var queueURL = 'https://sqs.us-east-1.amazonaws.com/821023756204/test_queue';
const ddb = new AWS.DynamoDB.DocumentClient();


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

function listenForSQS() {
    var params = {
        AttributeNames: ['SentTimestamp'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['All'],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 10
    };

    sqs.receiveMessage(params, function (recvErr, recvData) {
        if (recvErr) {
            console.log('Receive Error', recvErr);
        } else if (recvData.Messages) {
            var currentMessage = recvData.Messages[0];
            recordTransaction(JSON.parse(currentMessage.Body)).then(() => {
                var deleteParams = {
                    QueueUrl: queueURL,
                    ReceiptHandle: recvData.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function (delErr, delData) {
                    if (delErr) {
                        console.log('Delete Error', delErr);
                    } else {
                        console.log('Message Deleted', delData);
                    }
                });
            });

        }
    });
}

listenForSQS();
