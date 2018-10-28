const dynamo = require('../dynamo');
const Transaction = require('../../classes/transaction');
const Provider = require('../../classes/provider');
const Service = require('../../classes/service');
const Consumer = require('../../classes/consumer');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var service = new Service('bake bread', 59.6);
var consumer = new Consumer('moshe', 24, 'rosh-ain');
var provider = new Provider('amit', 21, 'address', [service]);

var consumer1 = new Consumer('itay', 24, 'rosh-ain');
var consumer2 = new Consumer('nadav', 24, 'rosh-ain');
var consumer3 = new Consumer('sheena', 24, 'rosh-ain');
var consumers = [
    consumer1,
    consumer2,
    consumer3
]
var transactionA = new Transaction('title1', provider, consumers);
var transactionB = new Transaction('title1', provider, consumers);

describe('test dynamo.js', function () {

    it('should store a record in DB and retrieve it by its ID', async () => {
        var transaction = new Transaction('a_title', provider, [consumer]);

        await dynamo.recordTransaction(transaction);
        var retrieved = await dynamo.getTransactionByID(transaction.id);

        return chai.expect(retrieved.Item).to.be.deep.equal(transaction.toJSON());
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

        expectedTransactions.forEach(async (tran) => {
            await dynamo.recordTransaction(tran);
        });

         var tByTitle = await dynamo.getTransactionsByTitle('title1');

        return chai.expect(tByTitle.Items).to.include(expectedTransactions);

    });
});

