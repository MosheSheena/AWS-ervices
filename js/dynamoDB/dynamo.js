var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient();

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
      docClient.scan(params, onScan);
    }
  }
}

function recordTransaction(transaction) {

  var params = {
    TableName: 'Transactions',
    Item: {
      'id': transaction.id,
      'title': transaction.title,
      'provider': transaction.provider,
      'consumers': transaction.consumers,
      'dateCreated': transaction.dateCreated,
      'dateExecuted': transaction.dateExecuted
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

function updateTransactionByID(id, title, provider, consumers) {
  var params = {
    TableName: 'Transactions',
    Key: {
      'id': id
    },
    UpdateExpression: 'set title=:t, provider=:p, consumers=:c',
    ExpressionAttributeValues: {
      ':t': title,
      ':p': provider,
      ':c': consumers
    },
    ReturnValues: 'ALL_NEW'
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

function getAllTransactions() {
  var params = {
    TableName: 'Transactions',
    ProjectionExpression: '#tid, title, provider, consumers',
    ExpressionAttributeNames: {
      '#tid': 'id'
    }
  };

  return docClient.scan(params, onScan).promise();
}

function getTransactionsByTitle(title) {
  var params = {
    TableName: 'Transactions',
    ProjectionExpression: '#tid, title, provider, consumers',
    FilterExpression: 'title = :expect_title',
    ExpressionAttributeNames: {
      '#tid': 'id'
    },
    ExpressionAttributeValues: {
      ':expect_title': title
    }
  };

  return docClient.scan(params, onScan).promise();
}

function recordService(service) {

  var params = {
    TableName: 'Services',
    Item: {
      'id': service.id,
      'description': service.description,
      'cost': service.cost,
      'providerId': service.providerId,
      'timeToDeliver': service.timeToDeliver,
      'quantity': service.quantity
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

function getAllServices() {
  var params = {
    TableName: 'Services',
    ProjectionExpression: '#sid, description, cost, provider, timeToDeliver, quantity',
    ExpressionAttributeNames: {
      '#sid': 'id'
    }
  };

  return docClient.scan(params, onScan).promise();
}

function getServicesForSell() {
  var params = {
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

  return docClient.scan(params, onScan).promise();
}

function getProviderServices(providerId) {
  var params = {
    TableName: 'Services',
    ProjectionExpression: '#sid, description, cost, providerId, timeToDeliver, quantity',
    FilterExpression: 'providerId = :expect_provider',
    ExpressionAttributeNames: {
      '#sid': 'id'
    },
    ExpressionAttributeValues: {
      ':expect_provider': providerId
    }
  };

  return docClient.scan(params, onScan).promise();
}

exports.recordTransaction = recordTransaction;
exports.getTransactionByID = getTransactionByID;
exports.updateTransactionByID = updateTransactionByID;
exports.deleteTransactionByID = deleteTransactionByID;
exports.getTransactionsByTitle = getTransactionsByTitle;
exports.getAllTransactions = getAllTransactions;
exports.recordService = recordService;
exports.getAllServices = getAllServices;
exports.getServicesForSell = getServicesForSell;
exports.getProviderServices = getProviderServices;
