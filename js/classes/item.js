const uuid = require('uuid');

class Item {
    constructor(name, category, cost, providerId, timeToDeliver, quantity) {

        this._id = uuid.v1();
        this._name = name;
        this._category = category;
        this._cost = cost;
        this._providerId = providerId;
        this._timeToDeliver = timeToDeliver; //Date object
        this._quantity = quantity;
    }

    get name() {
        return this._name;
    }

    get category() {
        return this._category;
    }

    get id() {
        return this._id;
    }

    get description() {
        return this._name;
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

    reduceAmount() {
        if (this._quantity > 0) {
            this._quantity--;

            return true;
        }

        return false;
    }
}

module.exports = Item;
