import $api from '../api/axios'
import {DeviceStats} from '../models/Stats'

const STATS_URL = '/stats-manadgement'

export default class StatsService {
    static async generateStats(
        device_id: number,
        stat_type: string,
        from: Date,
        to: Date,
        period: string
    ): Promise<string> {
        const response = await $api.post(
            `${STATS_URL}/${device_id}/auto`,
            {
                start: from,
                end: to,
                period: period,
            },
            {params: {type: stat_type}}
        )
        return response.data
    }

    static async editRecord(device_id: number, record_id: number, new_value: number): Promise<DeviceStats> {
        const response = await $api.patch(`${STATS_URL}/${device_id}`, null, {
            params: {record_id, new_value},
        })
        return response.data
    }

    static async removeRecords(device_id: number, type: string, start: Date, end: Date): Promise<string> {
        const response = await $api.delete(`${STATS_URL}/${device_id}`, {
            params: {
                type,
            },
            data: {start, end},
        })
        return response.data
    }
}
