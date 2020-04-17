const worker = require('creep.worker');

class RoomController {   
    static run(roomName) {
        this.spawn(roomName);
        this.defend(roomName);
        this.claim('E42S6');
    }
        
    static claim(room){
        const f = _.filter(Game.flags, (Flag) => Flag.name == 'CLAIM01');
        
        if(!f[0]) {
            return;
        }
        
        const c = _.filter(Game.creeps, (Creep) => Creep.name == 'CLAIM01');
        
        if(!c[0]) {
            const s = _.filter(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room);        
            
            if(s[0].spawning) {
                return;
            }            

            s[0].spawnCreep([MOVE,MOVE,MOVE,CLAIM],'CLAIM01');
        }
        
        if(f[0]) {
            c[0].moveTo(f[0].pos);
        }
        
        const rc = c[0].room.controller;
        
        if(rc) {
            c[0].claimController(rc);
        }
    }
    
    static defend(roomName) {
        const targets = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS/*, {
                filter: function(object) {
                    return object.getActiveBodyparts(ATTACK) > 0;
                }
            }*/);
            
        if(!targets.length) {
            this.repair(roomName);
            return;
        }        
        
        const towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
                    filter: (object) => {
                        return (object.structureType == STRUCTURE_TOWER) &&
                            (object.energy > 0);
                    }
            });   
            
        if(!towers.length) {
            return;
        }            
        
        for (let i = 0; i < towers.length; i++) {
            towers[i].attack(targets[0]);
        }
    }
    
    static repair(roomName) {
        const targets = Game.rooms[roomName].find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < structure.hitsMax);
            }
        });
        
        if(!targets.length) {
            return;
        }
        
        const towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
                    filter: (object) => {
                        return (object.structureType == STRUCTURE_TOWER) &&
                            (object.energy > 0);
                    }
            });   
            
        if(!towers.length) {
            return;
        }            
        
        towers[0].repair(targets[0]);
    }    
    
    static spawn(roomName) {
        const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == roomName);
        const sources = Game.rooms[roomName].find(FIND_SOURCES);
        
        if(creepCount.length < sources.length * 4) {
            worker.spawn(roomName, 'harvester');
        }        
    }
  
    static cleanup() {
    }
}

module.exports = RoomController;
