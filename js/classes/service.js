class Service {
    constructor(name, cost) {
        this._name = name;
        this._cost = cost;
    }
    get name() {
        return this._name;
    }
    get cost() {
        return this._cost;
    }
    set cost(cost) {
        this._cost = cost;
    }
    toJSON() {
        return {
            name: this._name,
            cost: this._cost
        };
      }
}

module.exports = Service;
