export interface RehearsalParticipant{
    surname: string
    rehearsal_id: number
}

export interface RehearsalCreate{
    participants: string[]
    start_time: Date
    duration: number
    band_name: string
}

export interface RehearsalRead{
    id: number
    user_id: number
    rehearsal_participants: RehearsalParticipant[]
    band_name: string
    start_time: Date
    duration: number
}