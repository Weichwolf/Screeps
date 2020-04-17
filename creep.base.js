class BaseCreep {    
    static spawn(room, body, name, opts) {
        let s = _.filter(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room);  
        
        if(!s[0]) {
            return;
        }
        
        if((s[0].spawning || (s[0].energy < 200)) && (Object.keys(Game.creeps).length > 1)) {
           return;
        }
        
        let e = Game.rooms[room].energyAvailable;            
        let n = Math.floor(e / 200);
        
        if(n > 8) {n = 8}

        let newName = name + Game.time;
        let struct = this.findEnergyStructures(room);

        let b = body;
        
        for (let i = 1; i < n; i++) {
            b = b.concat(body);
        }

        s[0].spawnCreep(b, newName, {memory: {role: name}, energyStructures: struct});            
    }
    
    static harvest(creep) {
        if(creep.ticksToLive < 80) {
            creep.suicide();
            return false;
        }
        
        if(creep.carry.energy > 0 && creep.memory.targetIdHarvest == null) {
            return false;
        }
        
        if(creep.carry.energy == creep.carryCapacity) {
            creep.memory.targetIdHarvest = null;
            return false;
        }
        
	    if(creep.memory.targetIdHarvest != null) {
	        var target = Game.getObjectById(creep.memory.targetIdHarvest);
	        
	        if((creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES) && (creep.carry.energy > 0)) {
	            creep.memory.targetIdHarvest = null;
                return false;
	        }
	        
	        if(creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES) {
                return true;
	        }
	        
	        if(creep.harvest(target) == ERR_NOT_IN_RANGE ) {
                this.moveToTarget(creep, target);
	        }
	    }   
	    else {
	        let s = this.findEnergySource(creep);
            if(s) {
                creep.say('🔄 harvest');
                creep.memory.targetIdHarvest = s.id;
	            this.changeTask(creep, creep.memory.role);
	            this.harvest(creep);
            }
	    }
	    return true;
    }

    static moveToTarget(creep, target) {
        if(Game.cpu.getUsed() > Game.cpu.limit) {
            return;
        }

        if(!creep.memory.target) {
            creep.memory.target = target;
        }

        if(creep.memory.target != target){
            creep.memory.path = null;
        }

        if(!creep.memory.path) {
            creep.memory.path = creep.pos.findPathTo(target);
        }
        creep.moveByPath(creep.memory.path);
    }
    
    static findEnergyStructures(room) {
         let s = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION 
                        || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy > 0;
                }
            });
        
        return s;
    }
    
    static findEnergySource(creep) {
        let s = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (structure) => {
                    return (structure.energy >= creep.energyCapacity);
                }
            });
            
        if(s) {
            return s;
        }              
        
        s = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (structure) => {
                    return (structure.energy > 0);
                }
            });
        
        if(s) {
            return s;
        }
        
        s = creep.pos.findClosestByPath(FIND_SOURCES);
        
        if(s) {
            return s;
        }        
        
        return false;
    }
    
    static changeTask(creep, task) {
        if(creep.memory.task == task) {
            return;
        }        
        
        creep.memory.task = task;
    }
    
    static getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}

module.exports = BaseCreep;