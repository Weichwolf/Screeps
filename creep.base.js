class BaseCreep {
    constructor() {
    }    
    
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

        if(s[0].spawnCreep(b, newName, {memory: {role: name}, energyStructures: struct}) == OK) {
            console.log('Spawning new ' + name + ' ' + newName + ' in room ' + room);
        }
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
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
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
        let s = creep.pos.findClosestByRange(FIND_SOURCES, {
                filter: (structure) => {
                    return (structure.energy == structure.energyCapacity);
                }
            });
            
        if(s) {
            return s;
        }
        
        s = creep.pos.findClosestByRange(FIND_SOURCES, {
                filter: (structure) => {
                    return (structure.ticksToRegeneration < 40);
                }
            });
        
        if(s) {
            return s;
        }        
        
        s = creep.pos.findClosestByRange(FIND_SOURCES, {
                filter: (structure) => {
                    return ((structure.energy / 10) > structure.ticksToRegeneration);
                }
            });
        
        if(s) {
            return s;
        }         
        
        s = creep.pos.findClosestByRange(FIND_SOURCES, {
                filter: (structure) => {
                    return (structure.energy > 0);
                }
            });
        
        if(s) {
            return s;
        }
        
        s = creep.pos.findClosestByRange(FIND_SOURCES);
        
        if(s) {
            return s;
        }        
        
        return false;
    }
    
    static changeTask(creep, task) {
        if(creep.memory.task == task) {
            return;
        }
        
        if(creep.memory.role != task) {
            console.log('Changing task of ' + creep.name + ' to ' + task);
        }
        
        creep.memory.task = task;
    }
    
    static getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}

module.exports = BaseCreep;