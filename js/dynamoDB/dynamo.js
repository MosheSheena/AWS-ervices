var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient();

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
      docClient.scan(params, onScan);
    }
  }
}

/**
 * Stores a transaction to DB
 * @param {Transaction} transaction - the transaction to store in DB
 * @returns {Promise} a promise that can be hooked with a callback to perform operations when call is done
 */
function recordTransaction(transaction) {

  var params = {
    TableName: 'Transactions',
    Item: {
      'id': transaction.id,
      'title': transaction.title,
      'provider': transaction.provider,
      'consumer': transaction.consumer,
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

/**
 * Fetch a transaction from the DB by it's id
 * @param {UUID} id - the uuid of the transaction
 * @returns {Promise} a promise that it's callback contains the transaction or any error if happen
 */
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

/**
 * Update transaction details in DB
 * @param {UUID} id - the uuid of the transaction
 * @param {String} title - as defined in the Transaction class
 * @param {Provider} provider - as defined in the Transaction class
 * @param {Consumer} consumer - as defined in the Transaction class
 * @returns {Promise} that can be hooked when we get a response from AWS
 */
function updateTransactionByID(id, title, provider, consumer) {
  var params = {
    TableName: 'Transactions',
    Key: {
      'id': id
    },
    UpdateExpression: 'set title=:t, provider=:p, consumer=:c',
    ExpressionAttributeValues: {
      ':t': title,
      ':p': provider,
      ':c': consumer
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

/**
 * Deletes a transaction from DB
 * @param {UUID} id - uuid of the transaction
 * @returns {Promise} that can be hooked with a callback to perform operations when we get the response from AWS
 */
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
  }).promise();
}

/**
 * Retrieves all the transaction for DB
 * @returns {Promise} that will contain an array with all transactions
 */
function getAllTransactions() {
  var params = {
    TableName: 'Transactions',
    ProjectionExpression: '#tid, title, provider, consumer',
    ExpressionAttributeNames: {
      '#tid': 'id'
    }
  };

  return docClient.scan(params, onScan).promise();
}

/**
 * Retrieves all transactions that their description matches
 * @param {String} title - as defined in Transaction class
 * @returns {Promise} that will contain an array with the matched transactions
 */
function getTransactionsByTitle(title) {
  var params = {
    TableName: 'Transactions',
    ProjectionExpression: '#tid, title, provider, consumer',
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

/**
 * Stores a service to DB
 * @param {Service} service - Service object to record
 * @returns {Promise} that holds the result of the operation
 */
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

/**
 * Fetch a service from the DB by it's id
 * @param {UUID} id - the uuid of the service
 * @returns {Promise} a promise that it's callback contains the service or any error if happen
 */
function getServiceByID(id) {
  var params = {
    TableName: 'Services',
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

/**
 * Retrieves all services from DB
 * @returns {Promise} containing all Services
 */
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

/**
 * Retrieves all services that still have quantity, meaning they are still
 * serviceable
 * @returns {Promise} containing the desired data of the query
 */
function getServicesForSell() {
  var params = {
    TableName: 'Services',
    ProjectionExpression: '#sid, description, cost, provider, timeToDeliver, quantity',
    FilterExpression: 'quantity > :expect_quantity',
    ExpressionAttributeNames: {
      '#sid': 'id'
    },
    ExpressionAttributeValues: {
      ':expect_quantity': 0
    }
  };

  return docClient.scan(params, onScan).promise();
}

/**
 * Retrieves all services that are provided by a specific provider
 * @param {Integer} providerId - provider's Id
 * @returns {Promise} containing all services that a provider has to offer
 */
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

/**
 * Update service details in DB
 * @param {UUID} id - the uuid of the service
 * @param {String} name - as defined in the Service class
 * @param {Integer} providerId - as defined in the Service class
 * @param {Consumer} timeToDeliver - as defined in the Service class
 * @param {Integer} quantity - as defined in the Service class
 * @returns {Promise} that can be hooked when we get a response from AWS
 */
function updateServiceByID(id, description, providerId, timeToDeliver, quantity) {
  var params = {
    TableName: 'Services',
    Key: {
      'id': id
    },
    UpdateExpression: 'set description = :d, providerId = :p, timeToDeliver = :t, quantity = :q',
    ExpressionAttributeValues: {
      ':d': description,
      ':p': providerId,
      ':t': timeToDeliver,
      ':q': quantity
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

/**
 * Get service quantity from DB
 * @param {UUID} serviceId - the uuid of the service
 * @returns {Integer} quantity available of that service
 */
async function getServiceQuantity(serviceId) {
  var s = await getServiceByID(serviceId);

  return s.Item.quantity;
}

/**
 * Update service quantity
 * @param {Service} service - the service to update its quantity
 * @param {Integer} quantity - new quantity that the service will have in DB
 * @returns {Promise} hookable callback to the operation
 */
function updateServiceQuantity(service, quantity) {

  return updateServiceByID(service.id, service.description, service.providerId, service.timeToDeliver, quantity)
}

exports.recordTransaction = recordTransaction;
exports.getTransactionByID = getTransactionByID;
exports.updateTransactionByID = updateTransactionByID;
exports.deleteTransactionByID = deleteTransactionByID;
exports.getTransactionsByTitle = getTransactionsByTitle;
exports.getAllTransactions = getAllTransactions;
exports.recordService = recordService;
exports.getServiceByID = getServiceByID;
exports.getAllServices = getAllServices;
exports.getServicesForSell = getServicesForSell;
exports.getProviderServices = getProviderServices;
exports.updateServiceByID = updateServiceByID;
exports.getServiceQuantity = getServiceQuantity;
exports.updateServiceQuantity = updateServiceQuantity;
