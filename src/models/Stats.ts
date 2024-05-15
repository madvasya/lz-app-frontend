export interface DeviceStatType {
    id: number
    name: string
    description: string
    unit: string
    lower_limit: number
    upper_limit: number
}

export interface DeviceStats {
    id: number
    device_id: number
    timestamp: Date
    value: number
    stat_type_id: number
}

export interface DeviceStatsCreate {
    timestamp: Date
    value: number
}
