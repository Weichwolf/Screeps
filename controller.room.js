const worker = require('creep.worker');


class RoomController {   
    static run(room) {
        this.update(room);
        this.spawn(room);
        this.defend(room);
        this.claim(room);
    }

    static update(room) {
        const sources = room.find(FIND_SOURCES);

        if(!room.memory.stats) {                   
            const stats = {
                'ticks' : 0,
                'sources' : []            
            };            

            for(let i in sources) {
                const source = {
                    'id' : sources[i].id,
                    'pos' : sources[i].pos,
                    'workers' : [],
                    'assigned' : 1,
                    'avaiable' : 0,
                    'harvested' : 0,
                    'rate' : 0
                };
                stats.sources.push(source);            
            }                                 
            room.memory.stats = stats;
        } else {
            room.memory.stats.ticks += 1;

            for(let s in room.memory.stats.sources) {
                if(room.memory.stats.sources[s].avaiable > sources[s].energy) {
                    room.memory.stats.sources[s].harvested += room.memory.stats.sources[s].avaiable - sources[s].energy;   
                }      

                room.memory.stats.sources[s].avaiable = sources[s].energy;                

                if(sources[s].energy > 0) {
                    room.memory.stats.sources[s].rate = room.memory.stats.sources[s].harvested / room.memory.stats.ticks;
                }
            }            
        }
        
        console.log(JSON.stringify(room.memory.stats));
    }
            
    static defend(room) {
        const targets = room.find(FIND_HOSTILE_CREEPS);
            
        if(!targets.length) {
            this.repair(room);
            return;
        }        
        
        const towers = room.find(FIND_STRUCTURES, {
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
    
    static repair(room) {
        const targets = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < structure.hitsMax);
            }
        });
        
        if(!targets.length) {
            return;
        }
        
        const towers = room.find(FIND_STRUCTURES, {
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
    
    static spawn(room) {
        const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == room);
        const sources = room.find(FIND_SOURCES);

        if(creepCount.length < sources.length * 4) {
            worker.spawn(room, 'harvester');
        }        
    }

    static claim(room){
        const f = _.filter(Game.flags, (Flag) => Flag.name == 'CLAIM01');
        
        if(!f[0]) {
            return;
        }
        
        const c = _.filter(Game.creeps, (Creep) => Creep.name == 'CLAIM01');
        
        if(!c[0]) {
            const s = _.filter(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room.name);        
            
            if(s[0].spawning) {
                return;
            }            

            s[0].spawnCreep([MOVE,CLAIM],'CLAIM01');

            return;
        }
        
        if(f[0]) {
            c[0].moveTo(f[0].pos);
        }
        
        const rc = c[0].room.controller;
        
        if(rc) {
            c[0].claimController(rc);
        }
    }    
  
    static cleanup() {
    }
}

module.exports = RoomController;
