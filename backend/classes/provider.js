const Person = require('./person');

/**
 * Class representing the provider of service, the one who sells the service and offers it to consumers.
 *
 * @param {Integer} id - passed to Parent class
 * @param {String} fullName - passed to Parent class
 * @param {Integer} age - passed to Parent class
 * @param {String} address - passed to Parent class
 * @param {Array.<Service>} servicesToProvide - array of service this provider is willing to offer.
 */
class Provider extends Person {
  constructor(id, fullName, age, address) {
    super(id, fullName, age, address);
    this._servicesToProvide = [];
  }
  get servicesToProvide() {
    return new Array(this._servicesToProvide);
  }
  getNumOfServices() {
    return this._servicesToProvide.length;
  }
  addService(service) {
    this._servicesToProvide.push(service);
  }
  removeService(service) {
    var index = this._servicesToProvide.indexOf(service);
    if (index > -1) {
      this._servicesToProvide.splice(index, 1);
    }
  }
}

module.exports = Provider;
