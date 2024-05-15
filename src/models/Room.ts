export interface RoomCreate {
    name: string
    area: number
    description: string
}

export interface RoomUpdate {
    name?: string
    description?: string
    area?: number
}

export interface RoomRead extends RoomCreate {
    id: number
    owner_id: number
}
