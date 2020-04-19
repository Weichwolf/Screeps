const BaseCreep = require('creep.base');

class WorkerCreep extends BaseCreep {   
    static run(creep) {
        if(creep.memory.task == 'recycle') {
            this.recycle(creep);
        } 
        if(creep.memory.task == 'pickup') {
            this.pickup(creep); 
        }           
        if(creep.memory.task == 'harvest') {
            this.harvest(creep);
        } 
        if(creep.memory.task == 'transfer') {
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
    
    static recycle(creep) {
        if(creep.ticksToLive > creep.memory.roundtrip) {
            this.changeTask(creep, 'pickup');
            return;
        }

        if(creep.store.getUsedCapacity([RESOURCE_ENERGY]) > 0) {
            this.changeTask(creep, 'transfer');
            return;
        }

	    if(creep.memory.targetIdRecycle == null) {
            let spawn = _.find(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == creep.room.name);      
           
            if(spawn) {
                creep.say('♻️ recycle');
                creep.memory.targetIdRecycle = spawn.id;
                this.recycle(creep);
            } else {
                creep.say('💀 suicide');
                creep.suicide();
            }
       } else {
            var spawn = Game.getObjectById(creep.memory.targetIdRecycle);
            
            if(!spawn) {
                creep.memory.targetIdRecycle = null;
            } else if(spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                super.moveToTarget(creep, spawn.pos);
            }
       }        
    }

    static pickup(creep) {
	    if(creep.memory.targetIdPickup == null) {
	         const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => {
                        return !this.getPickupTargets().includes(resource.id);
                    }
            });
            
            if(target) {
                creep.say('⚡ pickup');
                creep.memory.targetIdPickup = target.id;
                this.pickup(creep);
            } else {
                this.changeTask(creep, 'harvest');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdPickup);
	        
	        if((!target) || target.amount == 0) {
                creep.memory.targetIdPickup = null;
	        } else if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
	            super.moveToTarget(creep, target);
	        } else if(creep.pickup(target) == ERR_FULL) {
                creep.memory.targetIdPickup = null;
                this.changeTask(creep, 'transfer');
	        }
	    }
    }     

    static harvest(creep) {             
        if(creep.carry.energy == creep.carryCapacity) {
            this.changeTask(creep, 'transfer');
            return;
        }
        
	    if(creep.memory.targetIdHarvest != null) {
	        var target = Game.getObjectById(creep.memory.targetIdHarvest);
	        
	        if((creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES) && (creep.carry.energy > 0)) {
                this.changeTask(creep, 'transfer');
                return;
	        }
	        
	        if(creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES) {
                this.changeTask(creep, 'recycle');
                return;
	        }
	        
	        if(creep.harvest(target) == ERR_NOT_IN_RANGE ) {
                this.moveToTarget(creep, target);
	        }
	    }   
	    else {
	        creep.suicide();
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
                this.changeTask(creep, 'repairer');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdTransfer);
	        
	        if((!target) || target.energy == target.energyCapacity) {
	            creep.memory.targetIdTransfer = null;
	        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	            super.moveToTarget(creep, target);
	        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_FULL) {
	            creep.memory.targetIdTransfer = null;
	        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.targetIdTransfer = null;
                this.changeTask(creep, 'recycle');
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
                this.changeTask(creep, 'builder');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdRepairing);
	        
	        if(target == null || target.hits == target.hitsMax) {
	            creep.memory.targetIdRepairing = null;
	        } else if(creep.repair(target) == ERR_NOT_IN_RANGE) {
	            this.moveToTarget(creep, target);
	        } else if(creep.repair(target) == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.targetIdRepairing = null;
                this.changeTask(creep, 'recycle');
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
                        
                    const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == r);                        
                    
                    if(targets[0] && creepCount.length < 4) { 
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
                this.changeTask(creep, 'upgrader');
            }
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdBuilding);
	        
	        if(target == null || target.progress == target.progressTotal) {
	            creep.memory.targetIdBuilding = null;
	        } else if(creep.build(target) == ERR_NOT_IN_RANGE) {
	            this.moveToTarget(creep, target);
	        } else if(creep.build(target) == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.targetIdBuilding = null;
                this.changeTask(creep, 'recycle');
            }
	    }
    }    
    
    static upgrade(creep) {
        if(creep.room.controller == null) {
            creep.suicide();
            return;
        }
        
	    if(creep.memory.targetIdUpgrade == null) {
	        creep.say('⚡ upgrade');
            creep.memory.targetIdUpgrade = creep.room.controller.id;
            this.upgrade(creep);
	    } else {
	        var target = Game.getObjectById(creep.memory.targetIdUpgrade);
            var energy = creep.store.getUsedCapacity(RESOURCE_ENERGY);
            
	        if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
	            this.moveToTarget(creep, target);
	        } else if(creep.upgradeController(target) == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.targetIdUpgrade = null;
                this.changeTask(creep, 'recycle');
            }

            creep.memory.upgradeEnergy += energy - creep.store.getUsedCapacity(RESOURCE_ENERGY);
	    }
    }                
}
module.exports = WorkerCreep;
