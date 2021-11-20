import { Console } from "console";
import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { Defcon } from "military/defcon";
import { getMaxListeners } from "process";
import { RoleBuilder } from "roles/builder";
import { RoleBuilderForAnotherRoom } from "roles/builderForAnotherRoom";
import { RoleCarrier } from "roles/carrier";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { RoleHarvester } from "roles/harvester";
import { RoleMiner } from "roles/miner";
import { RoleRepairer } from "roles/repairer";
import { RoleUpgrader } from "roles/upgrader";
import { RoleUpgraderForAnotherRoom } from "roles/upgraderForAnotherRoom";
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
        targetContainerId?: string;
        forceMoveToTargetContainer?: boolean;
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

    // if (Game.creeps.Diplo.room != Game.flags.attackFlag.room)
    //     Game.creeps.Diplo.moveTo(Game.flags.attackFlag);
    // else {
    //     const controller = Game.creeps.Diplo.room.controller;

    //     if (controller) {
    //         if (Game.creeps.Diplo.claimController(controller) == ERR_NOT_IN_RANGE)
    //             Game.creeps.Diplo.moveTo(controller);
    //     }
    // }


    try {
        CreepsAct();
    } catch (error) {
        console.log('Error on CreepsAct ' + (<Error>error).message);
    }

    for (let s in Game.spawns) {
        const spawn: StructureSpawn = Game.spawns[s]; 0

        checkForHostiles(spawn);
        CreateCreeps(spawn);
    }

    // structureSpawn.tryCreateCreep('harvester',  Consts.maxNumberHarvester);
    //MyStructureSpawn.tryCreateCreep('upgrader', Consts.maxNumberUpgrader);
    // if (Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
    //     MyStructureSpawn.tryCreateCreep(Consts.roleBuilder, Consts.maxNumberBuilder);
    // }
    // MyStructureSpawn.tryCreateCreep(Consts.roleRepairer, Consts.maxNumberRepairer);
});

function checkForHostiles(spawn: StructureSpawn) {
    var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        Defcon.run(spawn);
    }
}

function CreepsAct() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role) {
            case Consts.roleHarvester: {
                RoleHarvester.run(creep);
                break;
            }
            case Consts.roleMiner: {
                RoleMiner.run(creep);
                break;
            }
            case Consts.roleCarrier: {
                RoleCarrier.run(creep);
                break;
            }
            case Consts.roleUpgrader: {
                RoleUpgrader.run(creep);
                break;
            }
            case Consts.roleUpgraderForAnotherRoom: {
                RoleUpgraderForAnotherRoom.run(creep);
                break;
            }
            case Consts.roleBuilder: {
                RoleBuilder.run(creep);
                break;
            }
            case Consts.roleBuilderForAnotherRoom: {
                RoleBuilderForAnotherRoom.run(creep);
                break;
            }
            case Consts.roleRepairer: {
                RoleRepairer.run(creep);
                break;
            }
            case Consts.roleFighterMelee: {
                FighterMelee.run(creep);
                break;
            }
            case Consts.roleFighterRanged: {
                FighterRanged.run(creep);
                break;
            }
            case Consts.rolefighterHealer: {
                FighterHealer.run(creep);
                break;
            }
            default: {
                break;
            }
        }
    }
}

function CreateCreeps(spawn: StructureSpawn) {
    let creepFactory: CreepFactory = new CreepFactory(spawn);
    let container = spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
        }
    });

    if (container) {
        const topCarriers = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleCarrier && c.memory.myContainerId == Consts.topContainerId);
        if (topCarriers.length < 1) {
            creepFactory.CreateCreep(Consts.roleCarrier, { role: Consts.roleCarrier, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.topContainerId })
        }

        const bottomCarriers = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleCarrier && c.memory.myContainerId == Consts.bottomContainerId);
        if (bottomCarriers.length < 1) {
            creepFactory.CreateCreep(Consts.roleCarrier, { role: Consts.roleCarrier, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.bottomContainerId })
        }

        const topMiners = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleMiner && c.memory.myContainerId == Consts.topContainerId);
        if (topMiners.length == 0) {
            creepFactory.CreateCreep(Consts.roleMiner, { role: Consts.roleMiner, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.topContainerId })
        }

        const bottomMiners = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleMiner && c.memory.myContainerId == Consts.bottomContainerId);
        if (bottomMiners.length == 0) {
            creepFactory.CreateCreep(Consts.roleMiner, { role: Consts.roleMiner, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.bottomContainerId })
        }
    } else {
        const harvesters = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleHarvester && c.memory.myContainerId == Consts.topContainerId);
        if (harvesters.length == 0) {
            creepFactory.CreateCreep(Consts.roleHarvester, { role: Consts.roleHarvester, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: Consts.topContainerId })
        }
    }

    const upgraders = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleUpgrader);
    if (upgraders.length < Consts.maxNumberUpgrader) {
        creepFactory.CreateCreep(Consts.roleUpgrader, { role: Consts.roleUpgrader, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' })
    }

    const repairer = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleRepairer);
    if (repairer.length < Consts.maxNumberRepairer) {
        creepFactory.CreateCreep(Consts.roleRepairer, { role: Consts.roleRepairer, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' })
    }

    if (spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        const builders = _.filter(spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleBuilder);
        if (builders.length < Consts.maxNumberBuilder) {
            creepFactory.CreateCreep(Consts.roleBuilder, { role: Consts.roleBuilder, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' })
        }
    }

    // let controller = spawn.room.controller;
    // if (controller) {
    //     if (controller.level >= 5) {
    //         const buildersForAntotherRoom = _.filter(Game.creeps, (c) => c.memory.role == Consts.roleBuilderForAnotherRoom);
    //         if (buildersForAntotherRoom.length < Consts.maxNumberBuilderForAnotherRoom) {
    //             spawn.spawnCreep(creepFactory.GetBodyPartsByRole(Consts.roleBuilderForAnotherRoom), Consts.roleBuilderForAnotherRoom + '-' + Math.random().toString(36).substr(2, 5),
    //                 { memory: { role: Consts.roleBuilderForAnotherRoom, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' } });
    //         }

    //         const upgradersForAntotherRoom = _.filter(Game.creeps, (c) => c.memory.role == Consts.roleUpgraderForAnotherRoom);
    //         if (upgradersForAntotherRoom.length < Consts.maxNumberUpgradersForAnotherRoom) {
    //             console.log('aqui');
    //             let ret = spawn.spawnCreep(creepFactory.GetBodyPartsByRole(Consts.roleUpgraderForAnotherRoom), Consts.roleUpgraderForAnotherRoom + '-' + Math.random().toString(36).substr(2, 5),
    //                 { memory: { role: Consts.roleUpgraderForAnotherRoom, working: false, room: Game.spawns.Spawn1.room.name, otherResources: [], myContainerId: '' } });
    //             console.log(ret);
    //         }
    //     }
    // }
}
