import $api from '../api/axios'
import {RehearsalRead, RehearsalCreate} from '../models/Rehearsal'

const REHEARSALS_URL = '/rehearsals'

export default class RehearsalService {
    static async fetchRehearsals(
        limit?: number,
        offset?: number,
        filter_from?: string,
        filter_to?: string
    ): Promise<{rehearsalArray: RehearsalRead[]; count: number}> {
        const response = await $api.get(REHEARSALS_URL, {
            params: {limit, offset, filter_from, filter_to},
        })
        const rehearsalArray = response.data
        const count = response.headers['x-total-count']
        return {rehearsalArray, count}
    }

    static async createRehearsal(newRehearsal: RehearsalCreate): Promise<RehearsalRead> {
        const response = await $api.post(REHEARSALS_URL, newRehearsal)
        return response.data
    }

    static async fetchRehearsal(id: number): Promise<RehearsalRead> {
        const response = await $api.get(`${REHEARSALS_URL}/${id}`)
        return response.data
    }

    static async removeRehearsal(id: number): Promise<string> {
        const response = await $api.delete(`${REHEARSALS_URL}/${id}`)
        return response.data
    }
}
