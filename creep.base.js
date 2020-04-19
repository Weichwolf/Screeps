class BaseCreep {       
    static moveToTarget(creep, target) {
        if(Game.cpu.getUsed() > Game.cpu.bucket / 100) {
            return;
        }

        if(!creep.memory.target) {
            creep.memory.target = target;
        }

        if(creep.memory.target != target){
            creep.memory.path = null;
        }

        if(!creep.memory.path) {
            const path = creep.pos.findPathTo(target);
            creep.memory.path = Room.serializePath(path);
        }
        creep.moveByPath(creep.memory.path);
    }    
        
    static changeTask(creep, task) {
        if(creep.memory.task == task) {
            return;
        }        
        
        creep.memory.task = task;
    }
    
    static getPickupTargets() {
        return _.map(Game.creeps, function(o) {return o.memory.targetIdPickup});
    }    

    static getTransferTargets() {
        return _.map(Game.creeps, function(o) {return o.memory.targetIdTransfer});
    }    
    
    static getRepairTargets() {
        return _.map(Game.creeps, function(o) {return o.memory.targetIdRepairing});
    }        
}

module.exports = BaseCreep;