const worker = require('creep.worker');

class CreepController {
    constructor() {
        this.testClaim('E42S6');
    }
    
    run(roomName) {
        this.spawn(roomName);
        this.defend(roomName);

        let myCreeps = _.mapValues(Game.creeps, function(Creep) { if(Creep.room.name == roomName){return Creep.name}});

        for(var name in myCreeps) {
            var creep = Game.creeps[name];
            
            worker.run(creep);
        }
    }
    
    testPos(creep) {
        if(creep.fatigue > 0) {
            console.log(creep.name + ' : ' + creep.pos.x);
            
            let myPos = Memory.myTest;
            myPos.push([creep.pos.x,creep.pos.x,1]);
        }
    }
    
    testClaim(room){
        const c = _.filter(Game.creeps, (Creep) => Creep.name == 'CLAIM01');
        
        if(!c[0]) {
            const s = _.filter(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room);        
            
            if(s[0].spawning) {
                return;
            }
            
            console.log(s[0].spawnCreep([MOVE,CLAIM],'CLAIM01'));
        }
        
        const f = _.filter(Game.flags, (Flag) => Flag.name == 'CLAIM01');
        
        if(f[0]) {
            c[0].moveTo(f[0].pos);
        }
        
        const rc = c[0].room.controller;
        
        if(rc) {
            c[0].claimController(rc);
        }
    }
    
    defend(roomName) {
        const targets = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS/*, {
                filter: function(object) {
                    return object.getActiveBodyparts(ATTACK) > 0;
                }
            }*/);
            
        if(!targets.length) {
            this.repair(roomName);
            return;
        }
        
        console.log('FIND_HOSTILE_CREEPS: ' + targets.length);
        
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
    
    repair(roomName) {
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
    
    spawn(roomName) {
        const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == roomName);
        const sources = Game.rooms[roomName].find(FIND_SOURCES);
        
        if(creepCount.length < sources.length * 4) {
            worker.spawn(roomName, 'harvester');
        }        
    }
  
    cleanup() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
}

module.exports = CreepController;
