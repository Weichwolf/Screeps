const roomController = require('controller.room');
const creepController = require('controller.creep');

class MainController {
    static run() {
        this.runRoomController();
        this.runCreepController();
    }

    static runRoomController() {
        const startTicks = Game.cpu.getUsed();

        for(let r in Game.rooms) {
            roomController.run(Game.rooms[r].name);
        }

        roomController.cleanup();

        console.log('Controlling ' + _.size(Game.rooms)
            + ' rooms using ' +  (Game.cpu.getUsed() - startTicks).toFixed(2) 
            + ' ticks from ' +  Game.cpu.limit + '|' + Game.cpu.tickLimit + '|' + Game.cpu.bucket);             
    }

    static runCreepController() {
        const startTicks = Game.cpu.getUsed();

        for(let c in Game.creeps) {
            creepController.run(Game.creeps[c]);
        }

        creepController.cleanup();

        console.log('Controlling ' + _.size(Game.creeps) 
            + ' creeps using ' + (Game.cpu.getUsed() - startTicks).toFixed(2) 
            + ' ticks from ' +  Game.cpu.limit + '|' + Game.cpu.tickLimit + '|' + Game.cpu.bucket);             
    }    
    
    static cleanup() {
        creepController.cleanup();
    }
}

module.exports = MainController;