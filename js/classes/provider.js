const Person = require('./person');
class Provider extends Person {
  constructor(fullName, age, address, servicesToProvide) {
    super(fullName, age, address);
    this._servicesToProvide = servicesToProvide;
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
