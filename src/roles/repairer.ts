import { RoleBuilder } from "./builder";

export class RoleRepairer {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    public static run(creep: Creep): void {

        // var dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

        // if (dropedEnergy && creep.store.getFreeCapacity() == 0) {
        //     roleHarvester.run(creep);
        //     return;
        // }

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('repairing');
        }


        // if creep is supposed to repair something
        if (creep.memory.working == true) {
            // find closest structure with less than max hits
            // Exclude walls because they have way too many max hits and would keep
            // our repairers busy forever. We have to find a solution for that later.
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL) || ((s.hits < (s.hitsMax / 100) && s.structureType == STRUCTURE_RAMPART))
            });

            // if we find one
            if (structure != undefined) {
                // try to repair it, if it is out of range
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                RoleBuilder.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (!source)
                return;

            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};
