var idGen = 0;
class Transaction {
  constructor(title, provider, consumers) {
    this._id = idGen++;
    this._title = title;
    this._provider = provider;
    this._consumers = consumers;
  }
  get id() {
    return this._id;
  }
  set title(name) {
    this._name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  get title() {
    return this._name;
  }
  get provider() {
    return this._provider;
  }
  sayHello() {
    console.log('Hello, my name is ' + this._name + ', I have ID: ' + this._id);
  }
}
