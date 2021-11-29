import { GlobalMemory } from "GlobalMemory";
import { Architect } from "meta/architect";
import { Overlord } from "meta/Overlord";
import { RoomInfo } from "roomInfo";
import { ErrorMapper } from "utils/ErrorMapper";
//var Traveler = require("libs/Traveler/Traveler");



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
        RunArchitect: boolean;
    }

    interface CreepMemory {
        forceMoveToTargetContainer?: boolean;
        isRenewing?: boolean;
        otherResources?: ResourceConstant[];
        role?: string;
        room?: string;
        structureToRepairId?: string;
        targetConstructionSiteId?: string;
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

    if(Memory.RunArchitect)
    {
        Memory.RunArchitect = false;
        console.log(Architect.RoomCanFitBunker(Game.rooms['E31S54']));
    }

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

    Overlord.rule();

    SaveMemory();
});

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
