const Person = require('./person');

class Seller extends Person {
    constructor(id, fullName, age, address) {
        super(id, fullName, age, address);
        this._itemsForSale = [];
    }

    get itemsForSale() {
        return this._itemsForSale;
    }

    getNumOfItems() {
        return this._itemsForSale.length;
    }

    addItem(item) {
        this._itemsForSale.push(item);
    }

    removeItem(item) {
        const index = this._itemsForSale.indexOf(item);

        if (index > -1) {
            this._itemsForSale.splice(index, 1);
        }
    }
}

module.exports = Seller;
