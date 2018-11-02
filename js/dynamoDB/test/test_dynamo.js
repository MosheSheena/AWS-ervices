const dynamo = require('../dynamo');
const Transaction = require('../../classes/transaction');
const Provider = require('../../classes/provider');
const Service = require('../../classes/service');
const Consumer = require('../../classes/consumer');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var today = new Date();
var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));

var consumer = new Consumer(4215, 'moshe', 24, 'rosh-ain');

var provider = new Provider(32432, 'amit', 21, 'address');

var consumer1 = new Consumer(9654, 'itay', 24, 'rosh-ain');
var consumer2 = new Consumer(3453, 'nadav', 24, 'rosh-ain');

var service = new Service('bake bread', 59.6, provider.id, tomorrow.toDateString(), 3);
var serviceA = new Service('train things', 50, provider.id, tomorrow.toDateString(), 5);
provider.addService(service);
provider.addService(serviceA);

var transactionA = new Transaction('title1', provider, consumer1);
var transactionB = new Transaction('title1', provider, consumer2);


describe('test transactions table', function () {

  it('should store a record in DB and retrieve it by its ID', async () => {
    var transaction = new Transaction('a_title', provider, [consumer]);

    await dynamo.recordTransaction(transaction);
    var retrieved = await dynamo.getTransactionByID(transaction.id);

    return chai.expect(JSON.parse(JSON.stringify(retrieved.Item))).to.be.deep.equal(transaction.toJSON());
  });

  it('should update transaction values', async () => {
    var transaction = new Transaction('a_title', provider, [consumer]);

    transaction.title = 'updatable';
    await dynamo.recordTransaction(transaction);
    var retrieved = await dynamo.updateTransactionByID(transaction.id, 'after', provider, [consumer]);
    transaction.title = 'after';

    return chai.expect(retrieved.Attributes).to.be.deep.equal(transaction.toJSON());
  });

  it('should retrieve list of transactions depending on their name', async () => {
    var expectedTransactions = [
      transactionA.toJSON(),
      transactionB.toJSON()
    ]

    await expectedTransactions.forEach(async (tran) => {
      await dynamo.recordTransaction(tran);
    });

    var tByTitle = await dynamo.getTransactionsByTitle('title1');

    return chai.expect(tByTitle.Items).to.include(expectedTransactions);

  });
});

describe('test services table', function() {

  it('should retrieve sellable services', async () => {
    await dynamo.recordService(serviceA);
    var res = await dynamo.getServicesForSell();

    return chai.expect(res.Items).to.be.equal(serviceA);
  });

  it('should retrieve services that belong to a specific provider', async () => {
    var expectedServices = [
        service,
        serviceA
    ];
    await dynamo.recordService(service);
    var res = await dynamo.getProviderServices(provider.id);

    return chai.expect(res.Items).to.be.equal(expectedServices);
  });

  it('should get the quantity of a service update it and get the quantity', async () => {
    var beforeQuantity = await dynamo.getServiceQuantity(service.id);
    chai.expect(beforeQuantity).to.be.equal(3);
    await dynamo.updateServiceQuantity(service, 0);
    var afterQuantity = await dynamo.getServiceQuantity(service.id);

    return chai.expect(afterQuantity).to.be.equal(0);
  });
});

