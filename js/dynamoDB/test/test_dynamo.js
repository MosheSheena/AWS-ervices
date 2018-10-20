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
var transaction = new Transaction('a_title', provider, [consumer]);


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
var transactionC = new Transaction('title2', provider, consumers);

describe('test dynamo.js', function () {

    it('should store a record in DB and retrieve it by its ID', function () {
        dynamo.recordTransaction(transaction);
        var retrieved = dynamo.getTransactionByID(transaction.id);

        return chai.expect(retrieved).to.be.eventually.equal(transaction);
    });

    it('should update transaction values', function () {
        transaction.title = 'updatable';
        dynamo.recordTransaction(transaction);
        var retrieved = dynamo.updateTransactionByID(transaction.id, 'after', provider, [consumer]);
        transaction.title = 'after';

        return chai.expect(retrieved).to.be.eventually.equal(transaction);
    });

    it('should retrieve list of transactions depeding on their name', function () {
        var expectedTranscations = [
            transactionA,
            transactionB
        ]

        expectedTranscations.forEach(function (tran) {
            dynamo.recordTransaction(tran);
        });

        dynamo.getTransactionsByTitle('title1').then(function (res) {
            var h = 1;
        });

        return chai.expect(dynamo.getTransactionsByTitle('title1')).to.be.eventually.equal(expectedTranscations);

    });
});

