import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { Defcon } from "military/defcon";
import { getMaxListeners } from "process";
import { RoleBuilder } from "roles/builder";
import { RoleCarrier } from "roles/carrier";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { RoleHarvester } from "roles/harvester";
import { RoleHarvesterStandStill } from "roles/harvesterStandStill";
import { RoleRepairer } from "roles/repairer";
import { RoleUpgrader } from "roles/upgrader";
import { MyStructureSpawn } from "structure/spawn";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
    }

    interface CreepMemory {
        role: string;
        room: string;
        working: boolean;
        otherResources: ResourceConstant[];
        myContainerId: string;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
    // var hostilesStructure = Game.creeps.Jeff.room.find(FIND_HOSTILE_SPAWNS)[0];
    // if(hostilesStructure)
    //     if(Game.creeps.Jeff.attack(hostilesStructure) == ERR_NOT_IN_RANGE)
    //         Game.creeps.Jeff.moveTo(hostilesStructure);

    // Game.creeps.Jeff.moveTo(Game.spawns.Spawn1);

    // if(Game.creeps.Diplo.room != Game.flags.attackFlag.room)
    //     Game.creeps.Diplo.moveTo(Game.flags.attackFlag);
    // else
    //     if(Game.creeps.Diplo.reserveController(Game.creeps.Diplo.room.controller) == ERR_NOT_IN_RANGE)
    //         Game.creeps.Diplo.moveTo(Game.creeps.Diplo.room.controller);

    for (let s in Game.spawns) {
        const spawn: StructureSpawn = Game.spawns[s];
        var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            Defcon.run(spawn);
        }

        let creepFactory : CreepFactory = new CreepFactory(spawn);
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            switch (creep.memory.role) {
                case 'harvester': {
                    RoleHarvester.run(creep);
                    break;
                }
                case 'harvesterStandStill': {
                    RoleHarvesterStandStill.run(creep);
                    break;
                }
                case 'carrier': {
                    RoleCarrier.run(creep);
                    break;
                }
                case 'upgrader': {
                    RoleUpgrader.run(creep);
                    break;
                }
                case 'builder': {
                    RoleBuilder.run(creep);
                    break;
                }
                case 'repairer': {
                    RoleRepairer.run(creep);
                    break;
                }
                case 'meleeFighter': {
                    FighterMelee.run(creep);
                    break;
                }
                case 'rangedFighter': {
                    FighterRanged.run(creep);
                    break;
                }
                case 'healerFighter': {
                    FighterHealer.run(creep);
                    break;
                }
                default: {
                    break;
                }
            }
        }

        const topHarvesters = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'harvesterStandStill' && c.memory.myContainerId == Consts.topContainerId);
        if (topHarvesters.length == 0) {
            spawn.spawnCreep(creepFactory.GetHarvesterBodyParts(), 'harvesterStandStill' + '-' + Math.random().toString(36).substr(2, 5),
                { memory: { role: 'harvesterStandStill', working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.topContainerId } });
        }

        const bottomHarvesters = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'harvesterStandStill' && c.memory.myContainerId == Consts.bottomContainerId);
        if (bottomHarvesters.length == 0) {
            spawn.spawnCreep(creepFactory.GetHarvesterBodyParts(), 'harvesterStandStill' + '-' + Math.random().toString(36).substr(2, 5),
                { memory: { role: 'harvesterStandStill', working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.bottomContainerId } });
        }

        const bottomCarriers = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'carrier' && c.memory.myContainerId == Consts.bottomContainerId);
        if (bottomCarriers.length < 1) {
            spawn.spawnCreep(Consts.carrierBody, 'carrier' + '-' + Math.random().toString(36).substr(2, 5),
                { memory: { role: 'carrier', working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.bottomContainerId } });
        }

        const topCarriers = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'carrier' && c.memory.myContainerId == Consts.topContainerId);
        if (topCarriers.length < 1) {
            spawn.spawnCreep(Consts.carrierBody, 'carrier' + '-' + Math.random().toString(36).substr(2, 5),
                { memory: { role: 'carrier', working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.topContainerId } });
        }

        const upgraders = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'upgrader');
        if (upgraders.length < Consts.maxNumberUpgrader) {
            spawn.spawnCreep(Consts.upgraderBody, 'upgrader' + '-' + Math.random().toString(36).substr(2, 5),
                { memory: { role: 'upgrader', working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' } });
        }
    }

    // structureSpawn.tryCreateCreep('harvester',  Consts.maxNumberHarvester);
    //MyStructureSpawn.tryCreateCreep('upgrader', Consts.maxNumberUpgrader);
    if (Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        MyStructureSpawn.tryCreateCreep('builder', Consts.maxNumberBuilder);
    }
    MyStructureSpawn.tryCreateCreep('repairer', Consts.maxNumberRepairer);
});
