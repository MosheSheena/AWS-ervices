var AWS = require('aws-sdk');
var dynamoDB = require('../dynamoDB/dynamo');
AWS.config.update({
    region: 'us-east-1'
});

var sqs = new AWS.SQS();

var queueURL = 'https://sqs.us-east-1.amazonaws.com/821023756204/test_queue';

function listenForSQS() {
    var params = {
        AttributeNames: ['SentTimestamp'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['All'],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 10
       };

       sqs.receiveMessage(params, function(recvErr, recvData) {
         if (recvErr) {
           console.log('Receive Error', recvErr);
         } else if (recvData.Messages) {
           var currentMessage = recvData.Messages[0];
           var messageAttributes = currentMessage.MessageAttributes;
           var messageType = messageAttributes.messageType;
           if (messageType == 'service') {
            dynamoDB.recordService(messageAttributes.Body);
           }
           else {
            dynamoDB.recordTransaction(messageAttributes.Body);
           }
           var deleteParams = {
             QueueUrl: queueURL,
             ReceiptHandle: recvData.Messages[0].ReceiptHandle
           };
           sqs.deleteMessage(deleteParams, function(delErr, delData) {
             if (delErr) {
               console.log('Delete Error', delErr);
             } else {
               console.log('Message Deleted', delData);
             }
           });
         }
       });
}

listenForSQS();
