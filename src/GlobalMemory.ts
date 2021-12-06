import { RoomData, RoomInfo } from "roomInfo";

export class GlobalMemory {
    private static _roomInfo: RoomInfo = {};

    public static get RoomInfo(): RoomInfo {
        return GlobalMemory._roomInfo;
    }
    public static set RoomInfo(value: RoomInfo) {
        GlobalMemory._roomInfo = value;
    }

    public static overlordProcessId?: number;
}
