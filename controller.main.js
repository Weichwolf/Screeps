const CreepController = require('controller.creep');

class MainController {
    
    constructor() {
        this.creepController = new CreepController();
    }
    
    run() {
        for(let r in Game.rooms) {
            const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == r);
            console.log('Controlling ' + creepCount.length + ' creeps in room: ' + Game.rooms[r].name);
            this.creepController.run(Game.rooms[r].name);
        }
        
        for(let s in Game.spawns) {
            if(Game.spawns[s].spawning) { 
                var spawningCreep = Game.creeps[Game.spawns[s].spawning.name];
                Game.spawns[s].room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    Game.spawns[s].pos.x + 1, 
                    Game.spawns[s].pos.y, 
                    {align: 'left', opacity: 0.8});
            }
        }
    }
    
    cleanup() {
        this.creepController.cleanup();
    }
}

module.exports = MainController;