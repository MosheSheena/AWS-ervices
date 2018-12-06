var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = 'https://sqs.us-east-1.amazonaws.com/827488408719/AW-services';

var params = {
 DelaySeconds: 10,
 MessageAttributes: {
  'Title': {
    DataType: 'String',
    StringValue: 'The Whistler'
   },
  'Author': {
    DataType: 'String',
    StringValue: 'John Grisham'
   },
  'WeeksOn': {
    DataType: 'Number',
    StringValue: '6'
   }
 },
 MessageBody: 'Information about current NY Times fiction bestseller for week of 12/11/2016.',
 QueueUrl: queueURL
};

sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data.MessageId);
  }
});
