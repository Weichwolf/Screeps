const worker = require('creep.worker');

class CreepController {   
    static run(creep) {
        worker.run(creep);
    }  
  
    static cleanup() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];                
            }
        }
    }
}

module.exports = CreepController;
