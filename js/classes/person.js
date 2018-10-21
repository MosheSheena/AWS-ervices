class Person {
    constructor(fullName, age, address) {
        this._fullName = fullName;
        this._age = age;
        this._address = address;
    }
    get fullName() {
        return this._fullName;
    }
    set fullName(fullName) {
        this._fullName = fullName;
    }
    get age() {
        return this._age;
    }
    set age(age) {
        this._fullName = age;
    }
    get address() {
        return this._address;
    }
    set address(address) {
        this._address = address;
    }
    toJSON() {
        return {
            fullName: this._fullName,
            age: this._age,
            address: this._address
        };
      }
}

module.exports = Person;
