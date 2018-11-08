const uuid = require('uuid');

/**
 * Class representing a successful transaction between a provider
 * and a consumer.
 *
 * @param {String} serviceID - the ID of the service that is being bought
 * @param {Integer} quantity - the quantity of service being bought
 * @param {String} providerUN - object containing provider data
 * @param {String} consumerUN - object containing consumer data
 */
class Transaction {
  constructor(serviceID, quantity, providerUN, consumerUN) {

    this._id = uuid.v1();
    this._serviceID = serviceID;
    this._quantity = quantity;
    this._providerUN = providerUN;
    this._consumerUN = consumerUN;
    this._dateCreated = Date.now();
  }

  get id() {
    return this._id;
  }

  get serviceID() {
    return this._serviceID;
  }

  get quantity() {
      return this._quantity;
  }

  get providerUN() {
    return this._providerUN;
  }

  get consumerUN() {
    return this._consumerUN;
  }

  get dateCreated() {
    return this._dateCreated;
  }
}

module.exports = Transaction;
