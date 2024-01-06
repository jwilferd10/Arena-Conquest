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
  };

  startIntro() {
    console.log(
      `
        =================
        Jest-Another-RPG!
        =================
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
  
    // User stats and enemy description before battle initialization
    console.log('==========================');
    console.log('You walk into the arena, deafened by the roaring sound of the crowd. Before the battle begins you prepare yourself.');
    console.log('Your stats are as follows:');
    console.table(this.player.getStats());
    console.log('==========================');

    // Let player start battle
    inquirer.prompt({
      type: 'text',
      name: 'startBattle',
      message: 'You prepare yourself!',
      default: "Hit 'Enter' to Start Battle!"
    }).then(() => {
      // Enemy Enters
      console.log(this.currentEnemy.getDescription());

      // Initialize battle
      this.battle();
    });
  };
  
  battle() {
    // Get a random attack description
    const getAttackDescription = this.attackDescription.getRandomAttackDescription();

    if (this.isPlayerTurn) {
      // Options
      inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        name: 'action',
        choices: ['Attack', 'Use potion']
      })
      .then(({ action }) => {
        if (action === 'Use potion') {
          // Player has empty inventory
          if (!this.player.getInventory()) {
            console.log("You don't have any potions!");
            return this.checkEndOfBattle();
          }
    
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
        } else {
          // Check enemy's AC
            // Based on a random chance (improved by AC num)
              // If block is true, negate player attack

          // Reduce enemy health based on player Attack Value
          const damage = this.player.getAttackValue();
          this.currentEnemy.reduceHealth(damage);
              
          // Player Attack
          console.log('==========================');
          console.log(`${this.player.name} ${getAttackDescription} the ${this.currentEnemy.name}`);
          console.log(this.currentEnemy.getHealth());

          // Check if player is alive
          this.checkEndOfBattle();
        }
      });
    } else {
      // Check players AC
      if (this.player.AC > this.currentEnemy.getAttackValue()) {
        // Based on a random chance (improved by AC num)
        // Negate enemy attack
        console.log('The attack is blocked!');
      } else {
        // Reduce player health based on Attack Value
        const damage = this.currentEnemy.getAttackValue();
        this.player.reduceHealth(damage);

        // Enemy Attack
        console.log(`The ${this.currentEnemy.name} ${getAttackDescription} ${this.player.name} with their ${this.currentEnemy.weapon}`);
        console.log(this.player.getHealth());
        console.log('==========================');
      };

      // Check if player is alive
      this.checkEndOfBattle();
    };
  };

  checkEndOfBattle() {
    if (this.player.isAlive() && this.currentEnemy.isAlive()) {
      this.isPlayerTurn = !this.isPlayerTurn;
      this.battle();
    } else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
      // If the current enemy is not alive, announce it.
      console.log(`You've defeated the ${this.currentEnemy.name}`);
  
      // Users collect potion from enemy
      this.player.addPotion(this.currentEnemy.potion);
      console.log(`${this.player.name} found a ${this.currentEnemy.potion.name} potion!`);
  
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
    } else {
      // Losing Announcement
      console.log("You've been defeated!");
    }
  };
};

module.exports = Game;