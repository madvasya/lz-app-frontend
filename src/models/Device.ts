export interface DeviceCreate {
    name: string
    description: string
    category_key: string
    room_id: number
}

export interface DeviceUpdate {
    name?: string
    description?: string
    room_id?: number
}

export interface DeviceRead {
    id: number
    name: string
    description: string
    created_on: Date
    room_id: number
    category_key: string
    category_name: string
}

export interface DeviceCategory {
    category_key: string
    name: string
    id: number
    description: number
}
