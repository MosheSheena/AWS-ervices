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

  var res = docClient.put(params, function (err, data) {
    if (err) {
      console.error('Unable to add transaction. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('PutItem succeeded ', JSON.stringify(data));
    }
  }).promise();

  return res;
}

function getTransactionByID(id) {
  var params = {
    TableName: 'Transactions',
    Key: {
      'transactionID': id
    },
    ReturnValues: 'ALL_OLD'
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

function updateTransactionByID(id, title, provider, consumers) {
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

  var res = docClient.update(params, function (err, data) {
    if (err) {
      console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
    }
  }).promise();

  return res;
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

function getTransactionsByTitle(title) {
  var params = {
    TableName: 'Transactions',
    ProjectionExpression: '#tid, title, provider, consumers',
    FilterExpression: 'title = :expect_title',
    ExpressionAttributeNames: {
      '#tid': 'transacntionID'
    },
    ExpressionAttributeValues: {
      ':expect_title': title
    }
  };

  function onScan(err, data) {
    if (err) {
      console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      console.log('Scan succeeded.');
      data.Items.forEach(function (transaction) {
        console.log(
          transaction.id + ': ', transaction.title,
          '- provider: ', transaction.provider,
          '- consumers: ', transaction.consumers
        );
      });

      /*
       * Continue scanning if we have more movies, because
       * scan can retrieve a maximum of 1MB of data
       */
      if (typeof data.LastEvaluatedKey != 'undefined') {
        console.log('Scanning for more...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  }

  return docClient.scan(params, onScan).promise();

}

exports.recordTransaction = recordTransaction;
exports.getTransactionByID = getTransactionByID;
exports.updateTransactionByID = updateTransactionByID;
exports.deleteTransactionByID = deleteTransactionByID;
exports.getTransactionsByTitle = getTransactionsByTitle;
