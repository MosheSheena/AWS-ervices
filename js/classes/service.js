const uuid = require('uuid');
class Service {

  /**
   * A service is a something, basically anything, that someone can offer
   * to the public and other can buy it. Ex. provider can offer to bake 5
   * breads for anyone who is willing to pay for it.
   * @param {String} description - describes what type of service this is
   * @param {Number} cost - the price of the service
   * @param {Integer} providerId - the id of the provider
   * @param {Date} timeToDeliver - deadline delivery
   * @param {Integer} quantity - how many times can the provider provide this service
   */
  constructor(description, cost, providerId, timeToDeliver, quantity) {
    this._id = uuid.v1();
    this._description = description;
    this._cost = cost;
    this._providerId = providerId;
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
  get providerId() {
    return this._providerId;
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
      provider: this._providerId,
      timeToDeliver: this._timeToDeliver,
      quantity: this._quantity
    };
  }
}

module.exports = Service;
