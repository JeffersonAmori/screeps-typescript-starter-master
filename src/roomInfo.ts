export interface RoomInfo {
    [key: string]: RoomData;
}

export class RoomData {
    public sumOfDistancesToSourcesFromSpawnHeuristic: number = 0;
}
