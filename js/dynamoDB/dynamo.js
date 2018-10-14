var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient();

function recordTransaction(transaction) {

  var params = {
    TableName: 'Transactions',
    Item: {
      'transactionID': transaction.id,
      'title': transaction.title,
      'provider': transaction.provider,
      'consumers': transaction.consumers
    }
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add transaction. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded ', JSON.stringify(data));
    }
  });
}

function getTransactionByID(id) {
  var params = {
    TableName: 'Transactions',
    Key: {
      'transactionID': id
    }
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

function updateTransactionBy(id, title, provider, consumers) {
  var params = {
    TableName: 'Transactions',
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

  docClient.update(params, function (err, data) {
    if (err) {
      console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
    }
  });
}

function deleteTransactionByID(id) {
  var params = {
    TableName: 'Transactions',
    Key: {
      'transactionID': id
    }
  };

  docClient.delete(params, function (err, data) {
    if (err) {
      console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2));
    }
  });
}

exports.recordTransaction = recordTransaction;
exports.getTransactionByID = getTransactionByID;
exports.updateTransactionBy = updateTransactionBy;
exports.deleteTransactionByID = deleteTransactionByID;
