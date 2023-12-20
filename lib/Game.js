// Imports from different files
const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');

class Game {
  constructor() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;
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
      message: 'What is your name?'
    })
    .then(({ name }) => {
      this.player = new Player(name);
  
      // test the object creation
      this.startNewBattle();
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
    console.log('Your stats are as follows:');
    console.table(this.player.getStats());
    console.log(this.currentEnemy.getDescription());
    this.battle();
  };
  
  battle() {
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
          // Reduce enemy health based on player Attack Value
          const damage = this.player.getAttackValue();
          this.currentEnemy.reduceHealth(damage);
    
          // Declare attack and showcase enemy health
          console.log(`You attacked the ${this.currentEnemy.name}`);
          console.log(this.currentEnemy.getHealth());

          // Check if player is alive
          this.checkEndOfBattle();
        }
      });
    } else {
      // Reduce player health based on Attack Value
      const damage = this.currentEnemy.getAttackValue();
      this.player.reduceHealth(damage);
  
      // Declare attack and showcase player health
      console.log(`You were attacked by the ${this.currentEnemy.name}`);
      console.log(this.player.getHealth());
  
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
        console.log('You win!');
      }
    } else {
      // Losing Announcement
      console.log("You've been defeated!");
    }
  };
};

module.exports = Game;