import $api from '../api/axios'
import {DeviceConfigField, DeviceConfigFieldRead} from '../models/Config'
import {DeviceRead, DeviceCreate, DeviceUpdate} from '../models/Device'
import {DeviceStats} from '../models/Stats'

const DEVICES_URL = '/devices'

export default class DeviceService {
    static async fetchDevices(
        limit?: number,
        offset?: number,
        room_id?: string,
        category_id?: string
    ): Promise<{deviceArray: DeviceRead[]; count: number}> {
        const response = await $api.get(DEVICES_URL, {
            params: {limit, offset, room_id, category_id},
        })
        const deviceArray = response.data
        const count = response.headers['x-total-count']
        return {deviceArray, count}
    }

    static async createDevice(newDevice: DeviceCreate, deviceConfig: DeviceConfigField[]): Promise<DeviceRead> {
        const response = await $api.post(DEVICES_URL, {
            device: newDevice,
            config: deviceConfig,
        })
        return response.data
    }

    static async fetchDevice(id: number): Promise<DeviceRead> {
        const response = await $api.get(`${DEVICES_URL}/${id}`)
        return response.data
    }

    static async editDevice(id: number, updatedDevice: DeviceUpdate): Promise<DeviceRead> {
        const response = await $api.patch(`${DEVICES_URL}/${id}`, updatedDevice)
        return response.data
    }

    static async removeDevice(id: number): Promise<string> {
        const response = await $api.delete(`${DEVICES_URL}/${id}`)
        return response.data
    }

    static async fetchDeviceConfig(id: number): Promise<DeviceConfigFieldRead[]> {
        const response = await $api.get(`${DEVICES_URL}/${id}/config`)
        return response.data
    }

    static async editDeviceConfig(id: number, updatedFields: DeviceConfigField[]): Promise<DeviceConfigFieldRead[]> {
        const response = await $api.patch(`${DEVICES_URL}/${id}/config`, updatedFields)
        return response.data
    }

    static async fetchDeviceStats(
        id: number,
        type: string,
        limit?: number,
        offset?: number,
        filter_from_datetime?: Date | null,
        filter_to_datetime?: Date | null
    ): Promise<DeviceStats[]> {
        const response = await $api.get(`${DEVICES_URL}/${id}/stats`, {
            params: {type, limit, offset, filter_from_datetime, filter_to_datetime},
        })
        return response.data
    }
}
