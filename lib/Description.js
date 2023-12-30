class Description {
    constructor() {
        this.meleeAttacks = [
            'slashes at',
            'strikes at',
            'thrusts towards',
            'lunges at',
            'swings at',
            'delivers a blow to',
            'executes a jab with',
            'thwacks at',
            'bashes against',
            'initiates an attack on',
            'jabs aggressively at',
            'sweeps a weapon at',
            'inflicts damage on',
            'rushes in for an attack on',
            'launches a strike at',
            'unleashes a flurry of blows on',
            'stabs at',
            'executes a quick assault on',
            'whirls around for an attack on',
            'charges with intent at',
            'delivers a powerful blow to',
            'strikes decisively at',
            'employs a strategic strike against'
        ];
    };

    getRandomAttackDescription() {
        const randomEmote = Math.floor(Math.random() * this.meleeAttacks.length);
        return this.meleeAttacks[randomEmote];
    }
};

module.exports = Description;