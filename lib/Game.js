// Imports from different files
const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');
const Description = require('./Description');

class Game {
  constructor() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;
    this.attackDescription = new Description();
    this.weaponData = [
      { name: 'Short-Sword', price: 50, damage: 5, attackBonus: 1, category: 'Weapon'},
      { name: 'Axe', price: 100, damage: 10, attackBonus: 2, category: 'Weapon'},
      { name: 'Spear', price: 150, damage: 15, attackBonus: 3, category: 'Weapon'},
    ];
    this.armorData = [
      { name: 'Used Armor Set', price: 50, armorBonus: 1, category: 'Armor'},
      { name: 'Cheap Armor Set', price: 100, armorBonus: 2, category: 'Armor'},
      { name: 'Modest Armor Set', price: 175, armorBonus: 3, category: 'Armor'},
      { name: 'Custom Set', price: 200, armorBonus: 4, category: 'Armor'},
    ];
  };

  startIntro() {
    console.log(
      `
        ==============
        Arena Conquest
        ==============
      `
    );

    const introduction = [
      {
        type: 'list',
        name: 'action',
        message: 'As you traverse the underbelly of the arena, a grim tableau unfolds. The air is thick with the acrid scent of iron and sweat, and the low rumble of restless creatures reverberates through the dimly lit space. Enclosed in sturdy cages, gladiators of varying visages cast furtive glances your way, their faces etched with the weariness of battle. Alongside them, monstrous forms lurk, their primal instincts held in check by formidable restraints. The harsh, flickering light exposes the scars and wear on both man and beast, hinting at the brutal struggles that lie ahead in this unforgiving arena.',
        choices: ['Continue >', 'Skip >>'],
      },
      {
        type: 'list',
        name: 'action',
        message: 'From the distance you spot the battlemaster, you approach the man and are met with an unimpressed stare. Determined you ask to participate in the brutal death-matches this arena is known for',
        choices: ['Continue >', 'Skip >>'],
      },
      {
        type: 'list',
        name: 'action',
        message: 'Smirking the battlemaster looks at you and asks...',
        choices: ['Next >>'],
      },
    ];

    let currentIntroIndex = 0;

    const processIntro = () => {
      const currentIntroScene = introduction[currentIntroIndex];

      inquirer.prompt(currentIntroScene)
        .then(({ action }) => {
          if (action === 'Continue >') {
            currentIntroIndex++;
            if (currentIntroIndex < introduction.length) {
              processIntro();
            } else {
              this.initializeGame();
            }
          } else if (action === 'Next >>' || action === 'Skip >>') {
            this.initializeGame();
          }
        })
    };
    // Start the introduction process
    processIntro();
  };

  initializeGame() {
    // Enemies and associated weapons
    this.enemies.push(new Enemy('goblin', 'sword'));
    this.enemies.push(new Enemy('orc', 'baseball bat'));
    this.enemies.push(new Enemy('skeleton', 'axe'));
    this.currentEnemy = this.enemies[0];

    inquirer.prompt({
      type: 'text',
      name: 'name',
      message: "What's your name?"
    })
    .then(({ name }) => {
      if(name === '') {
        console.log('You need to provide a name to participate in these arena fights.');
        this.initializeGame()
      } else {
        this.player = new Player(name);
        
        console.log('==========================');
        console.log('Your stats are as follows:');
        console.table(this.player.getStats());
        console.log('==========================');

        // test the object creation
        this.startNewBattle();
      }
    });
  };

  startNewBattle() {
    // Base the start of the battle off player agility
    if (this.player.agility > this.currentEnemy.agility) {
      this.isPlayerTurn = true;
    } else {
      this.isPlayerTurn = false;
    }
  
    console.log('You walk into the arena, deafened by the roaring sound of the crowd. Before the battle begins you prepare yourself.');

    // Let player start battle
    inquirer.prompt({
      type: 'text',
      name: 'startBattle',
      message: 'You prepare yourself!',
      default: "Hit 'Enter' to Start Battle!"
    }).then(() => {
      // Enemy Enters and initialize battle
      console.log('==========================');
      console.log(this.currentEnemy.getDescription());
      this.battle();
    });
  };
  
  battle() {
    // When battle is initialized, get a random attack description that will pass onto both player and enemy emotes
    const getAttackDescription = this.attackDescription.getRandomAttackDescription();

    if (this.isPlayerTurn) {
      this.playerTurnActions(getAttackDescription);
    } else {
      this.enemyTurnActions(getAttackDescription);
    }
  };

  // Logic for using a potion
  handlePotionUse() {
    // Showcase available potions
    inquirer.prompt({
      type: 'list',
      message: 'Which potion would you like to use?',
      name: 'action',
      choices: this.player.getInventory().map((item, index) => `${index + 1}: ${item.name}`)
    })
    .then(({ action }) => {
      // Player using a potion
      const potionDetails = action.split(': ');

      this.player.usePotion(potionDetails[0] - 1);
      console.log(`You used a ${potionDetails[1]} potion.`);
      this.checkEndOfBattle();
    });
  };

  // playerTurnActions is the user's turn, presented with options on what they'd like to do
  playerTurnActions(getAttackDescription) {
    // Options
    inquirer.prompt({
      type: 'list',
      message: 'What would you like to do?',
      name: 'action',
      choices: ['Attack', 'Use potion']
    }).then(({ action }) => {
      if (action === 'Use potion') {
        // Player has empty inventory
        if (!this.player.getInventory()) {
          console.log("You don't have any potions!");
          return this.checkEndOfBattle();
        } else {
          // Initialize potion event
          this.handlePotionUse();
        }
      } else {
        // Initialize attack, pass the attack Description
        this.handlePlayerAttack(getAttackDescription);
      }
    });
  };

  // enemyTurnAction is the enemy turn, this will check if the player blocks the attack or if attack is successful.
  enemyTurnActions(getAttackDescription) {
    // Announce enemies attack
    console.log(`The ${this.currentEnemy.name} ${getAttackDescription} ${this.player.name} with their ${this.currentEnemy.weapon}`);

    // Generate enemy attack chance
    const enemyAttackChance = this.currentEnemy.calculateAttackChance();

    if (this.player.AC > enemyAttackChance) {
      console.log(`But ${this.player.name} blocks the attack!`);
    } else {
      this.handleEnemyAttack();
    };

    // Check if player is alive
    this.checkEndOfBattle();
  };

  handlePlayerAttack(getAttackDescription) {
    // Announce player attack
    console.log('==========================');
    console.log(`${this.player.name} ${getAttackDescription} the ${this.currentEnemy.name}`);

    // Generate characters attack chance
    const playerAttackChance = this.player.calculateAttackChance();
    
    if (this.currentEnemy.AC > playerAttackChance) {
      console.log(`But ${this.currentEnemy.name} blocks the attack!`);
    } else {
      // Reduce enemy health based on player Attack Value
      const damage = this.player.getAttackValue();
      this.currentEnemy.reduceHealth(damage);
      console.log(this.currentEnemy.getHealth());
    };

    // Check if player is alive
    this.checkEndOfBattle();
  };

  handleEnemyAttack() {
    // Reduce player health based on Attack Value
    const damage = this.currentEnemy.getAttackValue();
    this.player.reduceHealth(damage);

    // Enemy Attack
    console.log(this.player.getHealth());
    console.log('==========================');
  };

  checkEndOfBattle() {
    if (this.player.isAlive() && this.currentEnemy.isAlive()) {
      this.isPlayerTurn = !this.isPlayerTurn;
      this.battle();
    } else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
      // If the current enemy is not alive, announce it.
      console.log(`You've defeated the ${this.currentEnemy.name}`);
  
      // Users collect potion from enemy
      this.player.gp = this.currentEnemy.gp + this.player.gp;
      this.player.addPotion(this.currentEnemy.potion);
      console.log(`${this.player.name} found a ${this.currentEnemy.potion.name} potion!`);
      console.log(`${this.player.name} has won ${this.currentEnemy.gp} for beating the ${this.currentEnemy.name}`);
      console.log('==========================');

      // Check if player wants to purchase items from a shop or continue the battle
      inquirer.prompt({
        type: 'list',
        message: 'There are still more enemies to fight. Do you wish to continue or barter with a merchant?',
        name: 'endBattleAction',
        choices: ['Continue', 'Visit Merchant'],
      })
      .then(({ endBattleAction }) => {
        if(endBattleAction === 'Continue') {
          console.log('You wait for the next battle...');
          this.incrementRound();
        } else {
          this.merchantShop();
        }
      });
    } else {
      // Losing Announcement
      console.log("You've been defeated!");
    }
  };

  // Display for merchant shop menu
  merchantShop() {
    console.log('==========================');
    console.log('Welcome to the Merchant Shop!');

    // Define available options
    const options = ['Weapons', 'Armor', 'Exit'];

    // Select an option, switch case handles user input by routing to appropriate function
    inquirer.prompt({
      type: 'list',
      message: 'There are no refunds on items purchased here, what would you like to browse?',
      name: 'options',
      choices: options,
    })
    .then (({ options }) => {
      switch (options) {
        case 'Weapons':
          this.showWeaponInventory();
          break;
        case 'Armor':
          this.showArmorInventory();
          break;
        case 'Exit':
          console.log('You step away from the Merchant Shop...');
          console.log('==========================');
          this.incrementRound();
          break;
        default: 
          console.log('Invalid choice. Please try again');
          this.merchantShop();
      }
    });
  };

  // Display for merchant weapons
  showWeaponInventory() {
    console.log('Here are the available weapons:');
    console.table(this.weaponData);

    // Showcase store options
    inquirer.prompt({
      type: 'list',
      message: 'What would you like to purchase?',
      name: 'weaponChoice',
      choices: ['Short-Sword', 'Axe', 'Spear', 'Go Back'],
    })
    .then(({ weaponChoice }) => {
      if (weaponChoice === 'Go Back') {
        this.merchantShop();
      } else {
        // User selection passed through purchaseEquipment
        this.purchaseEquipment(weaponChoice);
      }
    });
  };

  // Display for merchant armor
  showArmorInventory() {
    console.log('Here are the available armor pieces');
    console.table(this.armorData);

    // Showcase store options
    inquirer.prompt({
      type: 'list',
      message: 'What would you like to purchase?',
      name: 'armorChoice',
      choices: ['Used Armor Set', 'Cheap Armor Set', 'Modest Armor Set', 'Custom Set', 'Go Back'],
    })
    .then (({ armorChoice }) => {
      if (armorChoice === 'Go Back') {
        this.merchantShop();
      } else {
        // User selection passed through purchaseEquipment
        this.purchaseEquipment(armorChoice);
      }
    });
  };

  // Checks user's purchase and selects what to update based on purchase category
  purchaseEquipment(purchasedItem) {
    // Collect purchasedItem into a new variable
    const item = 
      this.weaponData.find((weapon) => weapon.name === purchasedItem && weapon.category === 'Weapon') ||
      this.armorData.find((armor) => armor.name === purchasedItem && armor.category === 'Armor');

    // Return player to merchant menu if they have insufficient funds
    if (this.player.gp < item.price || this.player.gp === 0) {
      console.log("You can't afford this!");
      this.merchantShop();
    } else {
      if (this.player.armor === item.name || this.player.weapon === item.name) {
        console.log(`You already own the ${item.name}. No need to purchase it again.`);
        this.merchantShop();
      } else {      
        // Retrieve information of the purchased item
        console.log(`Player has bought ${purchasedItem}`);
        console.log(`${item.category} item:`, item);
        
        // Update player's equipment
        if (item.category === 'Weapon') {
          this.purchaseWeapon(item);
        } else if (item.category === 'Armor') {
          this.purchaseArmor(item);
        };

        // deduct GP and increment round
        this.player.gp -= item.price;
        this.incrementRound();
      };
    };
  };

  // Update player weapon stats
  purchaseWeapon(item) {
    this.player.weapon = item.name;
    this.player.strength = this.player.strength + item.damage;
    this.player.BA = this.player.BA + item.attackBonus;

    console.log(`You purchased ${item.name} for ${item.price}.`);
    console.log('Updated player stats:');
    console.table(this.player.getStats());
  };

  // Update player armor stats
  purchaseArmor(item) {
    this.player.armor = item.name;
    this.player.AC = this.player.AC + item.armorBonus;

    console.log(`You purchased ${item.name} for ${item.price}.`);
    console.log('Updated player stats:');
    console.table(this.player.getStats());

    // TEST CONSOLE LOG (see ba: undefined)
    console.log(this.player);
  };

  // Increment round or check if player wins
  incrementRound() {
    // Increase the roundNumber to continue
    this.roundNumber++;

    if (this.roundNumber < this.enemies.length) {
      // If there are more enemies, continue the game
      this.currentEnemy = this.enemies[this.roundNumber];
      this.startNewBattle();
    } else {
      // No more enemies, you win!
      console.log(`You've bested all the beasts thrown your way, the crowd eagerly chants ${this.player.name}. You win!`);
    }
  };
};

module.exports = Game;