const Potion = require('./Potion');
const Character = require('./Character');

class Enemy extends Character {
    // Enemy class
    constructor(name, weapon) {
        super(name);
        this.weapon = weapon;
        this.potion = new Potion();
    }

    // Enemy Description
    getDescription() {
        return `A ${this.name} holding a ${this.weapon} has appeared!`;
      }
};

module.exports = Enemy;