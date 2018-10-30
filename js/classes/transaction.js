const uuid = require('uuid');

class Transaction {
  constructor(title, provider, consumer) {

    this._id = uuid.v1();
    this._title = title;
    this._provider = provider;
    this._consumer = consumer;
    this._dateCreated = Date.now();
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

  get consumer() {
    return this._consumer;
  }

  get dateCreated() {
    return this._dateCreated;
  }
}

module.exports = Transaction;
