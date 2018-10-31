class Person {

    /**
     * @param {Integer} id - id of the person
     * @param {String} fullName - full name of person
     * @param {Integer} age - age of person
     * @param {String} address - address of person
     */
    constructor(id, fullName, age, address) {
        this._id = id;
        this._fullName = fullName;
        this._age = age;
        this._address = address;
    }
    get id() {
        return this._id;
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
            id: this._id,
            fullName: this._fullName,
            age: this._age,
            address: this._address
        };
      }
}

module.exports = Person;
