class RoomController {   
    static run(room) {
        this.update(room);
        this.spawn(room);
        this.defend(room);
        this.claim(room);
    }

    static update(room) {      
        //delete room.memory.stats;
        //delete room.memory.sources;

        if(!room.memory.stats) {               
            const sources = room.find(FIND_SOURCES);
            let spawn = _.find(Game.spawns, (StructureSpawn) => StructureSpawn.room.name == room.name);  
            let path = PathFinder.search(spawn.pos, { pos: room.controller.pos, range: 1 });

            room.memory.stats = {
                'reschedule' : global.RESCHEDULE_TICKS,
                'spawnpathcost' : path.cost
            };            

            room.memory.sources = {};

            for(let i in sources) {
                let path = PathFinder.search(sources[i].pos, { pos: room.controller.pos, range: 1 });

                const source = {
                    'pos' : sources[i].pos,
                    'workers' : global.WORKERS_SOURCE,
                    'body' : global.WORKER_BODY,
                    'roundtripcost' : path.cost * 2
                };

                room.memory.sources[sources[i].id] = source;            
            }                         
        } else {
            room.memory.stats.reschedule -= 1;      
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
        for(let i in room.memory.sources) {
            if(this.getAssignedCreepCount(i) < room.memory.sources[i].workers) {
                this.spawnCreep(room, room.memory.sources[i].body, 'pickup', i);
            }
        }        
    }

    static spawnCreep(room, body, name, sourceId) {
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
      
        const mutated = this.mutateBody(body);
        const roundtripcost = room.memory.sources[sourceId].roundtripcost + room.memory.stats.spawnpathcost;

        const memory = {
            room: room.name,
            workers: room.memory.sources[sourceId].workers,
            task: name, 
            body: mutated, 
            targetIdHarvest: sourceId, 
            ticksToRecycle: roundtripcost            
        }

        spawn.spawnCreep(mutated, newName, {memory: memory, energyStructures: struct});            
    }

    static mutateBody(body) {
        if(Math.round(Math.random()) == 0) {
            return body;
        }

        var mutated;

        if(Math.round(Math.random()) == 0){
            mutated = body.concat(_.sample(body));
        } else {
            mutated = _.shuffle(body);
            mutated = _.drop(mutated);
        }

        if(!body.every(v => mutated.includes(v))){
            return this.mutateBody(body);
        }

        const ordered = _.sortBy(mutated);        
        return ordered;
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
