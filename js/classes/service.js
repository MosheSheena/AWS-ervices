const uuid = require('uuid');
class Service {
  constructor(name, cost, provider, timeToDeliver, quantity) {
    this._id = uuid.v1();
    this._description = name;
    this._cost = cost;
    this._provider = provider;
    this._timeToDeliver = timeToDeliver; //Date object
    this._quantity = quantity;
  }
  get id() {
    return this._id;
  }
  get description() {
    return this._description;
  }
  get cost() {
    return this._cost;
  }
  set cost(cost) {
    this._cost = cost;
  }
  get provider() {
    return this._provider;
  }
  get timeToDeliver() {
    return this._timeToDeliver;
  }
  set timeToDeliver(date) {
    this._timeToDeliver = date;
  }
  get quantity() {
    return this._quantity;
  }
  set quantity(quantity) {
    if (quantity >= 0) {
      this._quantity = quantity;
    }
  }
  provide() {
    if (this._quantity > 0) {
      this._quantity--;

      return true;
    }

    return false;
  }
  toJSON() {
    return {
      id: this._id,
      description: this._description,
      cost: this._cost,
      provider: this._provider.toJSON(),
      timeToDeliver: this._timeToDeliver,
      quantity: this._quantity
    };
  }
}

module.exports = Service;
