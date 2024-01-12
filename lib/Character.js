// The 'Character' class is shared between the Player and Enemy classes, this checks for their name and stats, health related data, and attack data
class Character {
    constructor(name = '') {
        this.name = name;
        this.health = Math.floor(Math.random() * 10 + 95);
        this.strength = Math.floor(Math.random() * 5 + 7);
        this.agility = Math.floor(Math.random() * 5 + 7);
        this.AC = Math.floor(Math.random() * 3 + 7)
        this.gp = 50;
    };

    getAttackValue() {
        const min = this.strength - 5;
        const max = this.strength + 5;
        return Math.floor(Math.random() * (max - min) + min);
    };

    getHealth() {
        return `${this.name}'s health is now ${this.health}!`
    };

    reduceHealth(health) {
        this.health -= health;

        if (this.health < 0) {
            this.health = 0;
        };
    };

    isAlive() {
        if (this.health === 0) {
            return false;
        }
        return true;  
    };
};

module.exports = Character;