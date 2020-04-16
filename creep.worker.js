const BaseCreep = require('creep.base');

class WorkerCreep extends BaseCreep {
    static spawn(room, role) {
        super.spawn(room, [WORK,CARRY,MOVE], role);
    }
    
    static run(creep) {
        if(super.harvest(creep)) {
            return;
        };
        
        if(creep.memory.task == 'harvester') {
            this.transfer(creep);
        } 
        if(creep.memory.task == 'repairer') {
            this.repair(creep); 
        }
        if(creep.memory.task == 'builder') {
            this.build(creep);            
        }
        if(creep.memory.task == 'upgrader') {
            this.upgrade(creep);
        }  
    }
    
    static transfer(creep) {
	    if(creep.memory.targetIdTransfer == null) {
	         const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION 
                            || structure.structureType == STRUCTURE_SPAWN
                            || structure.structureType == STRUCTURE_TOWER) &&
                            (structure.energy < structure.energyCapacity) &&
                            !this.getTransferTargets().includes(structure.id);
                    }
            });
            
            if(target) {
                creep.say('⚡ transfer');
                creep.memory.targetIdTransfer = target.id;
                this.transfer(creep);
            } else {
                super.changeTask(creep, 'repairer');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdTransfer);
	        
	        if((!target) || target.energy == target.energyCapacity) {
	            creep.memory.targetIdTransfer = null;
	        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
	        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_FULL) {
	            creep.memory.targetIdTransfer = null;
	        }
	    }
    }
    
    static repair(creep) {
	    if(creep.memory.targetIdRepairing == null) {
	        const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < structure.hitsMax) &&
                            !this.getRepairTargets().includes(structure.id);
                }
            });

            if(target) {
                creep.say('🚧 repair');
                creep.memory.targetIdRepairing = target.id;
                this.repair(creep);
            } else {
                super.changeTask(creep, 'builder');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdRepairing);
	        
	        if(target == null || target.hits == target.hitsMax) {
	            creep.memory.targetIdRepairing = null;
	            this.changeTask(creep, creep.memory.role);
	        } else if(creep.repair(target) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
	        }
	    }
    }    
    
    static build(creep) {
	    if(creep.memory.targetIdBuilding == null) {
	        var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);

            if(!target){
                for(var r in Game.rooms) {
                    var targets = Game.rooms[r].find(FIND_MY_CONSTRUCTION_SITES,  {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN);
                        }});
                    
                    if(targets[0]) { 
                        target = targets[0];
                        break; 
                    }                                	        
                }
            }
            
            if(target) {
                creep.say('🚧 build');
                creep.memory.targetIdBuilding = target.id;
                this.build(creep);
            }
            else {
                super.changeTask(creep, 'upgrader');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdBuilding);
	        
	        if(this.isSpawnEvent()) {
	            creep.memory.targetIdBuilding = null;
	            super.changeTask(creep, creep.memory.role);
	        } else if(target == null || target.progress == target.progressTotal) {
	            creep.memory.targetIdBuilding = null;
	            this.changeTask(creep, creep.memory.role);
	        } else if(creep.build(target) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
	        }
	    }
    }    
    
    static upgrade(creep) {
	    if(creep.memory.targetIdUpgrade == null) {
	        creep.say('⚡ upgrade');
            creep.memory.targetIdUpgrade = creep.room.controller.id;
            this.upgrade(creep);
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdUpgrade);
	        
	        if(this.isSpawnEvent()) {
	            creep.memory.targetIdUpgrade = null;
	            super.changeTask(creep, creep.memory.role);
	        } else if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
	        }
	    }
    }    
    
    static getTransferTargets() {
        return _.map(Game.creeps, function(o) {return o.memory.targetIdTransfer});
    }
    
    static getRepairTargets() {
        return _.map(Game.creeps, function(o) {return o.memory.targetIdRepairing});
    }    
    
    static isSpawnEvent() {
        if(!Game.spawns['Spawn1'].spawning)
        {
            return false;
        }
            
        let t = Game.spawns['Spawn1'].spawning.needTime - Game.spawns['Spawn1'].spawning.remainingTime;
        
        return (t < 10);
    }
}
module.exports = WorkerCreep;
