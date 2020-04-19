class RoomController {   
    static run(room) {
        this.update(room);
        this.spawn(room);
        this.defend(room);
        this.claim(room);
    }

    static update(room) {      
        if(!room.memory.stats) {                   
            const sources = room.find(FIND_SOURCES);

            const stats = {
                'ticks' : 0,
                'workers' : 0,
                'sources' : []            
            };            

            for(let i in sources) {
                let path = PathFinder.search(sources[i].pos, { pos: room.controller.pos, range: 1 });

                const source = {
                    'id' : sources[i].id,
                    'pos' : sources[i].pos,
                    'workers' : 4,
                    'roundtrip' : path.cost * 2
                };
                stats.sources.push(source);            
            }                                 
            room.memory.stats = stats;
        } else {
            const sources = room.find(FIND_SOURCES);

            room.memory.stats.ticks += 1;
            room.memory.stats.workers = 0;

            for(let i in room.memory.stats.sources) {
                room.memory.stats.workers += room.memory.stats.sources[i].workers;
            }            
        }        
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
        const creepCount = _.filter(Game.creeps, (Creep) => Creep.room.name == room.name);

        if(creepCount.length < room.memory.stats.workers) {
            this.spawn2(room, 'pickup');
        }        
    }

    static spawn2(room, role) {
        this.spawn3(room, [WORK,CARRY,MOVE], role);
    }

    static spawn3(room, body, name) {
        let spawn = _.find(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room.name);  
        
        if(!spawn) {
            return;
        }
        
        if((spawn.spawning || (room.energyAvailable < 200)) && (Object.keys(Game.creeps).length > 1)) {
           return;
        }
        
        let e = Game.rooms[room.name].energyAvailable;            
        let n = Math.floor(e / 200);
        
        if(n > 8) {n = 8}

        let newName = 'creep' + Game.time;
        let struct = this.findEnergyStructures(room.name);

        let b = body;
        
        for (let i = 1; i < n; i++) {
            b = b.concat(body);
        }

        const source = this.getSource(room);

        spawn.spawnCreep(b, newName, {memory: {task: name, targetIdHarvest: source.id, roundtrip: source.roundtrip}, energyStructures: struct});            
    }

    static getSource(room) {
        for(let i in room.memory.stats.sources) {
            const assigned = this.getAssignedCreepCount(room.memory.stats.sources[i].id);
            
            if(assigned < room.memory.stats.sources[i].workers) {
                return room.memory.stats.sources[i];
            }
        }    
        
        return room.memory.stats.sources[i];
    }    

    static getAssignedCreepCount(sourceId) {
        let assigned = _.countBy(Game.creeps, function(o) {if(o.memory.targetIdHarvest == sourceId){return "count";}});
        
        if(!assigned.count) {
            return 0;
        }

        return assigned.count;
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

    static cleanup() {
    }
}

module.exports = RoomController;
