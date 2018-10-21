const uuid = require('uuid');
class Transaction {
  constructor(title, provider, consumers) {
    this._id = uuid.v1();
    this._title = title;
    this._provider = provider;
    this._consumers = consumers;
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
  execute() {
    this._dateExecuted = Date.now();
  }
  toJSON() {
    return {
        id: this._id,
        title: this._title,
        provider: this._provider,
        consumers: this._consumers,
        dateCreated: this._dateCreated,
        dateExecuted: this._dateExecuted
    };
  }
}

module.exports = Transaction;
