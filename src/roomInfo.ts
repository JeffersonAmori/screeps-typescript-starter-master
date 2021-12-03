export interface RoomInfo {
    [key: string]: RoomData;
}

export class RoomData {
    public sumOfDistancesToSourcesFromSpawnHeuristic?: number = 0;
    public storageLinkId?: string | null = null;
    public upgraderContainerId?: string | null = null;
}
