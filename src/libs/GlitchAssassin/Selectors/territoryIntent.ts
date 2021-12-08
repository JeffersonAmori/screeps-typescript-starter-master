import { controllerId, sourceIds } from "./roomCache";
import { roomPlans } from "./roomPlans";


export enum TerritoryIntent {
    AVOID = 'AVOID',
    ACQUIRE = 'ACQUIRE',
    DEFEND = 'DEFEND',
    EXPLOIT = 'EXPLOIT',
    IGNORE = 'IGNORE'
}

export const getTerritoryIntent = (roomName: string): TerritoryIntent => {
    let controller = controllerId(roomName);
    let roomPlan = roomPlans(roomName);
    let sources = sourceIds(roomName);
    const hostiles = (Game.time - (Memory.rooms[roomName]?.lastHostileSeen ?? 0) <= 10)
    const invaderCore = Memory.rooms[roomName]?.scanned && Memory.rooms[roomName].invaderCore === Memory.rooms[roomName].scanned
    if (invaderCore) return TerritoryIntent.AVOID;

    if (!controller) {
        return TerritoryIntent.IGNORE;
    }
    if (Memory.rooms[roomName]?.owner && !Game.rooms[roomName]?.controller?.my) {
        return TerritoryIntent.AVOID;
    } else if (Memory.roomPlans[roomName]?.office) {
        if (hostiles && Memory.offices[roomName]) {
            // Owned Office has hostiles present, recently
            return TerritoryIntent.DEFEND;
        } else {
            return TerritoryIntent.ACQUIRE;
        }
    } else if (sources.length > 0) {
        return TerritoryIntent.EXPLOIT;
    } else {
        return TerritoryIntent.IGNORE;
    }
}
