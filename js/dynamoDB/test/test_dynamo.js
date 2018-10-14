const dynamo = require('../dynamo');
const Transaction = require('../../classes/transaction');
const Provider = require('../../classes/provider');
const Service = require('../../classes/service');
const Consumer = require('../../classes/consumer');
const chai = require('chai');

describe('store and retrieve', function () {
    it('should store a record in DB and retrieve it by its ID', function () {
        var service = new Service('bake bread', 59.6);
        var consumer = new Consumer('moshe', 24, 'rosh-ain');
        var provider = new Provider('amit', 21, 'address', [service]);
        var transaction = new Transaction('a_title', provider, [consumer]);
        dynamo.recordTransaction(transaction);
        var retrieved = dynamo.getTransactionByID(transaction.id);
        chai.expect(retrieved).to.be.equal(transaction);
    });
});

