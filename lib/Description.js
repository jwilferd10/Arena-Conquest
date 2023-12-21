class Description {
    constructor() {
        this.meleeAttacks = [
            'slashes at',
            'strikes with',
            'thrusts towards',
            'lunges at',
            'swings a weapon at',
            'delivers a blow to',
            'executes a jab with',
            'thwacks with',
            'pierces through',
            'bashes against',
            'hurls a projectile at',
            'smashes into',
            'brandishes a weapon towards',
            'initiates an attack on',
            'jabs aggressively with',
            'sweeps a weapon at',
            'wields a weapon against',
            'inflicts damage with',
            'rushes in for an attack on',
            'launches a strike at',
            'unleashes a flurry of blows on',
            'stabs at',
            'executes a quick assault on',
            'whirls around for an attack on',
            'charges with intent at',
            'sweeps in with a deadly strike',
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