const uuid = require('uuid');

/**
 * Class representing a successful transaction between a provider
 * and a consumer.
 * @param {String} title - a title describing the transaction
 * @param {Provider} provider - object containing provider data
 * @param {Consumer} consumer - object containing consumer data
 */
class Transaction {
  constructor(title, provider, consumer) {
    this._id = uuid.v1();
    this._title = title;
    this._provider = provider;
    this._consumers = consumer;
    this._dateCreated = Date.now();
    this._dateExecuted = null;
  }
  get id() {
    return this._id;
  }
  set title(title) {
    this._title = title;
  }
  get title() {
    return this._title;
  }
  get provider() {
    return this._provider;
  }
  get consumers() {
    return this._consumers;
  }
  get dateCreated() {
    return this._dateCreated;
  }
  get dateExecuted() {
    return this._dateExecuted;
  }
  /**
   * Completed the agreed transaction between the provider and
   * the consumer
   * @returns {Boolean} indicating the success of the operation
   */
  execute() {
    if (this._dateExecuted !== null) {
      this._dateExecuted = Date.now();

      return true;
    }

    return false;
  }
  toJSON() {
    return {
        id: this._id,
        title: this._title,
        provider: this._provider.toJSON(),
        consumers: JSON.parse(JSON.stringify(this._consumers)),
        dateCreated: this._dateCreated,
        dateExecuted: this._dateExecuted
    };
  }
}

module.exports = Transaction;
