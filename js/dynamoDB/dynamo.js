var AWS = require('aws-sdk');

var dynamoDB = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

function init() {
  AWS.config.update({
    region: 'us-east-1'
  });

  var params = {
    TableName: 'Trasactions',
    KeySchema: [
      { AttributeName: 'transactionID', KeyType: 'HASH' },  //Partition key
      { AttributeName: 'title', KeyType: 'RANGE' },  //Sort key
      { AttributeName: 'provider', KeyType: 'RANGE' },
      { AttributeName: 'numConsumers', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'transactionID', AttributeType: 'N' },
      { AttributeName: 'title', AttributeType: 'S' },
      { AttributeName: 'provider', AttributeType: 'S' },
      { AttributeName: 'numConsumers', AttributeType: 'N' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  };

  dynamoDB.createTable(params, function (err, data) {
    if (err) {
      console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
    }
  });
}


function recordTransaction(transaction) {

  var params = {
    TableName: 'Trasactions',
    Item: {
      'transactionID': transaction.id,
      'title': transaction.title,
      'provider': transaction.provider,
      'consumers': transaction.consumers
    }
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add movie', transaction.title, '. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded:', transaction.title);
    }
  });
}

function getTransactionByID(id) {
  var params = {
    TableName: 'Trasactions',
    Key: {
      'transactionID': id
    }
  };
  docClient.get(params, function (err, data) {
    if (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('GetItem succeeded:', JSON.stringify(data, null, 2));
    }
  });
}

function updateTransactionBy(id, title, provider, consumers) {
  var params = {
    TableName: 'Trasactions',
    Key: {
      'transactionID': id
    },
    UpdateExpression: 'set title=:t, provider=:p, consumers=:c',
    ExpressionAttributeValues: {
      ':t': title,
      ':p': provider,
      ':c': consumers
    },
    ReturnValues: 'UPDATED_NEW'
  };

  docClient.update(params, function(err, data) {
    if (err) {
        console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
        console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
    }
});
}

exports.init = init;
exports.recordTransaction = recordTransaction;
exports.getTransactionByID = getTransactionByID;
exports.updateTransactionBy = updateTransactionBy;
