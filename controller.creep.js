const worker = require('creep.worker');

class CreepController {   
    static run(creep) {
        worker.run(creep);

        if(!creep.memory.body) {            
            creep.memory.body = _.values(_.mapValues(creep.body, 'type'));
        }

        if(!creep.memory.room) {
            creep.memory.room = creep.room.name;
        }        

        if(!creep.memory.workers) {
            creep.memory.workers = global.WORKERS_SOURCE;
        }

        if(!creep.memory.ticksToRecycle) {
            creep.memory.ticksToRecycle = 80;
        }
    }  
  
    static cleanup() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                this.updateStats(Memory.creeps[name]);

                delete Memory.creeps[name];                
            }
        }
    }

    static updateStats(memory) {
        if(!memory.upgradeEnergy) {
            memory.upgradeEnergy = 0;
        }

        if(!Memory.rooms[memory.room].sources[memory.targetIdHarvest].upgradeEnergy) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].upgradeEnergy = memory.upgradeEnergy;
        }

        if(!Memory.rooms[memory.room].sources[memory.targetIdHarvest].body) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].body = memory.body;
        }

        if(!Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats = {};
        }        

        if(!Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers]) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers] = {bodystats : {}, upgradeEnergy : 0};
        }

        if(Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].upgradeEnergy = 0) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].upgradeEnergy = memory.upgradeEnergy;
        }

        let workerAverage = Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].upgradeEnergy;
        workerAverage *= global.MOVING_AVERAGE_GENERATIONS;
        workerAverage += memory.upgradeEnergy;
        workerAverage /= global.MOVING_AVERAGE_GENERATIONS + 1;
        Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].upgradeEnergy = workerAverage;

        if(!Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].bodystats[JSON.stringify(memory.body)]) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].bodystats[JSON.stringify(memory.body)] = {upgradeEnergy : memory.upgradeEnergy};
        }

        let bodyAverage = Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].bodystats[JSON.stringify(memory.body)].upgradeEnergy;
        bodyAverage *= global.MOVING_AVERAGE_GENERATIONS;
        bodyAverage += memory.upgradeEnergy;
        bodyAverage /= global.MOVING_AVERAGE_GENERATIONS + 1;
        Memory.rooms[memory.room].sources[memory.targetIdHarvest].workerstats[memory.workers].bodystats[JSON.stringify(memory.body)].upgradeEnergy = bodyAverage;

        if(bodyAverage > Memory.rooms[memory.room].sources[memory.targetIdHarvest].upgradeEnergy) {
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].body = memory.body;
            Memory.rooms[memory.room].sources[memory.targetIdHarvest].upgradeEnergy = bodyAverage;
        }
    }
}

module.exports = CreepController;
