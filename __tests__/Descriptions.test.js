const Description = require('../lib/Description.js');

describe('Description class', () => {
    test('Should return a valid attack description', () => {
        const description = new Description();
        const randomAttackDescription = description.getRandomAttackDescription();

        expect(typeof randomAttackDescription).toBe('string');
        expect(description.meleeAttacks).toContain(randomAttackDescription);
    });
});