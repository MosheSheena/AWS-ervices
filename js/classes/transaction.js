const uuid = require('uuid');
class Transaction {
  constructor(title, provider, consumers) {
    this._id = uuid.v1();
    this._title = title;
    this._provider = provider;
    this._consumers = consumers;
  }
  get id() {
    return this._id;
  }
  set title(title) {
    this._title = title.charAt(0).toUpperCase() + title.slice(1);
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
  sayHello() {
    console.log('Hello, my name is ' + this._name + ', I have ID: ' + this._id);
  }
}

module.exports = Transaction;
