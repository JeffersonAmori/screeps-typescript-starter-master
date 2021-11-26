import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { filter, initial } from "lodash";
import { Defcon } from "military/defcon";
import { Mother } from "Mother";
import { getMaxListeners } from "process";
import { RoleBuilder } from "roles/builder";
import { RoleCarrier } from "roles/carrier";
import { RoleCarrierTeleporter } from "roles/carrierTeleporter";
import { FighterMeleeForAnotherRoom } from "roles/fighterForAnotherRoom";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { RoleHarvester } from "roles/harvester";
import { RoleMiner } from "roles/miner";
import { RoleMinerTeleporter } from "roles/minerTeleporter";
import { RolePioneer } from "roles/pioneer";
import { RoleRepairer } from "roles/repairer";
import { RoleUpgrader } from "roles/upgrader";
import { RoomData, RoomInfo } from "roomInfo";
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
        RoomsInfo: string;
        Started: boolean;
    }

    interface CreepMemory {
        forceMoveToTargetContainer?: boolean;
        isRenewing?: boolean;
        otherResources?: ResourceConstant[];
        role: string;
        room: string;
        structureToRepairId?: string;
        targetContainerId?: string;
        targetEnemyId?: string;
        targetEnergySourceId?: string;
        targetStructureLinkId?: string
        working?: boolean;
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
    if (!Memory.Started)
        Init();

    LoadMemory();
    CleanMemory();

    try {
        // if (Game.creeps.Jeff.room != Game.flags.attackFlag.room) {
        //     Game.creeps.Jeff.moveTo(Game.flags.attackFlag);
        // } else {
        //     var hostilesStructure = Game.creeps.Jeff.room.find(FIND_HOSTILE_STRUCTURES)[0];
        //     if (hostilesStructure)
        //         if (Game.creeps.Jeff.attack(hostilesStructure) == ERR_NOT_IN_RANGE) {
        //             Game.creeps.Jeff.moveTo(hostilesStructure);
        //         }
        // else {
        //     let structures = Game.creeps.Jeff.room.find(FIND_STRUCTURES, {
        //         filter: (s) => (s.hits == 1 && s.structureType == STRUCTURE_WALL)
        //     });

        //     if (!structures)
        //         return;

        //     let targetStructure = Game.creeps.Jeff.pos.findClosestByRange(structures);
        //     if (targetStructure)
        //         if (Game.creeps.Jeff.attack(targetStructure) == ERR_NOT_IN_RANGE)
        //             Game.creeps.Jeff.moveTo(targetStructure);
        // }
        // }
        // }

        // Game.creeps.Jeff.moveTo(spawn);

        // if (Game.creeps.Diplo.room != Game.flags.attackFlag.room)
        //     Game.creeps.Diplo.moveTo(Game.flags.attackFlag);
        // else {
        //     const controller = Game.creeps.Diplo.room.controller;

        //     if (controller) {
        //         let ret = Game.creeps.Diplo.claimController(controller);
        //         console.log(ret);
        //         if (ret == ERR_NOT_IN_RANGE)
        //             Game.creeps.Diplo.moveTo(controller);
        //     }
        // }
    }
    catch { }

    try {
        CreepsAct();
    } catch (error) {
        console.log('Error on CreepsAct ' + (<Error>error).message);
        throw error;
    }

    for (let s in Game.spawns) {
        const spawn: StructureSpawn = Game.spawns[s]; 0

        checkForHostiles(spawn);
        let mother = new Mother(spawn);
        mother.CreateCreeps();
    }

    SaveMemory();
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
            case Consts.roleMinerTeleporter: {
                RoleMinerTeleporter.run(creep);
                break;
            }
            case Consts.roleCarrier: {
                RoleCarrier.run(creep);
                break;
            }
            case Consts.roleCarrierTeleporter: {
                RoleCarrierTeleporter.run(creep);
                break;
            }
            case Consts.roleUpgrader: {
                RoleUpgrader.run(creep);
                break;
            }
            case Consts.roleBuilder: {
                RoleBuilder.run(creep);
                break;
            }
            case Consts.roleRepairer: {
                RoleRepairer.run(creep);
                break;
            }
            case Consts.rolePioneer: {
                RolePioneer.run(creep);
                break;
            }
            case Consts.roleFighterMelee: {
                FighterMelee.run(creep);
                break;
            }
            case Consts.roleFighterMeleeForAnotherRoom: {
                FighterMeleeForAnotherRoom.run(creep);
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



function Init() {
    let roomInfo: RoomInfo = {}
    _.forEach(Game.rooms, room => roomInfo[room.name] = {})
    Memory.RoomsInfo = JSON.stringify(roomInfo);
    Memory.Started = true;
}

function LoadMemory() {
    GlobalMemory.RoomInfo = JSON.parse(Memory.RoomsInfo);
}

function SaveMemory() {
    Memory.RoomsInfo = JSON.stringify(GlobalMemory.RoomInfo);
}

function CleanMemory() {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}
